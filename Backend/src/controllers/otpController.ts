import { Request, Response } from "express";
import { EmailOtpDao } from "../daos/EmailOtpDao";
import { UserDao } from "../daos/UserDao";
import { generateOtp, isValidEmail, sanitizeEmail } from "../utils/otpHelpers";
import { sendOtpEmail, sendPasswordResetEmail } from "../services/EmailService";
import { query } from "../db/db";
import bcrypt from "bcrypt";
import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
  TooManyRequestsError,
} from "../utils/errors";

export const sendVerificationOtp = async (req: Request, res: Response) => {
  const { email, account_type } = req.body;

  // Validation
  if (!email || !account_type) {
    throw new BadRequestError("Email and account_type are required");
  }

  if (!isValidEmail(email)) {
    throw new BadRequestError("Invalid email format");
  }

  if (!["user", "seller"].includes(account_type)) {
    throw new BadRequestError(
      "Invalid account_type. Must be 'user' or 'seller'",
    );
  }

  // Check if account exists (all account types are users now)
  const account = await UserDao.findUserByEmail(email);

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  // Check if already verified
  if (account.is_verified_email) {
    throw new BadRequestError("Email already verified");
  }

  // Check rate limit
  const canRequest = await EmailOtpDao.canRequestOtp(email, account_type);
  if (!canRequest) {
    throw new TooManyRequestsError(
      "Too many requests. Please try again in an hour",
    );
  }

  // Generate and store OTP
  const otp = generateOtp();
  await EmailOtpDao.createOtp(email, otp, account_type, "email_verification");

  // Send email
  const emailSent = await sendOtpEmail(
    email,
    otp,
    account.name,
    "verification",
  );

  if (!emailSent) {
    throw new InternalServerError(
      "Failed to send verification email. Please try again",
    );
  }

  console.log(`📧 Verification OTP sent to ${sanitizeEmail(email)}`);

  return res.success(null, "Verification code sent to your email", 201);
};

export const verifyEmailOtp = async (req: Request, res: Response) => {
  const { email, otp, account_type } = req.body;

  if (!email || !otp || !account_type) {
    throw new BadRequestError("Email, OTP, and account_type are required");
  }

  if (!["user", "seller"].includes(account_type)) {
    throw new BadRequestError("Invalid account_type");
  }

  const isValid = await EmailOtpDao.verifyOtp(
    email,
    otp,
    account_type,
    "email_verification",
  );

  if (!isValid) {
    throw new BadRequestError("Invalid or expired verification code");
  }

  // Update email verification status
  await query("UPDATE users SET is_verified_email = TRUE WHERE email = $1", [
    email,
  ]);

  // Clean up used OTPs
  await EmailOtpDao.deleteOtpsByEmail(email, account_type);

  console.log(`✅ Email verified for ${sanitizeEmail(email)}`);

  return res.success(null, "Email verified successfully");
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email, account_type } = req.body;

  if (!email || !account_type) {
    throw new BadRequestError("Email and account_type are required");
  }

  if (!["user", "seller", "admin"].includes(account_type)) {
    throw new BadRequestError("Invalid account_type");
  }

  const canRequest = await EmailOtpDao.canRequestOtp(email, account_type);
  if (!canRequest) {
    throw new TooManyRequestsError(
      "Too many requests. Please try again in an hour",
    );
  }

  const account = await UserDao.findUserByEmail(email);

  if (!account) {
    return res.success(null, "If the email exists, a reset code has been sent");
  }

  const otp = generateOtp();
  await EmailOtpDao.createOtp(email, otp, account_type, "password_reset");

  // Send email
  await sendPasswordResetEmail(email, otp, account.name);

  console.log(`📧 Password reset OTP sent to ${sanitizeEmail(email)}`);

  return res.success(
    null,
    "If the email exists, a reset code has been sent",
    201,
  );
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, new_password, account_type } = req.body;

  if (!email || !otp || !new_password || !account_type) {
    throw new BadRequestError("All fields are required");
  }

  if (new_password.length < 8) {
    throw new BadRequestError("Password must be at least 8 characters");
  }

  const isValid = await EmailOtpDao.verifyOtp(
    email,
    otp,
    account_type,
    "password_reset",
  );

  if (!isValid) {
    throw new BadRequestError("Invalid or expired reset code");
  }

  const hashedPassword = await bcrypt.hash(new_password, 10);

  await query("UPDATE users SET password = $1 WHERE email = $2", [
    hashedPassword,
    email,
  ]);

  await EmailOtpDao.deleteOtpsByEmail(email, account_type);

  console.log(`✅ Password reset for ${sanitizeEmail(email)}`);

  return res.success(null, "Password reset successfully");
};
