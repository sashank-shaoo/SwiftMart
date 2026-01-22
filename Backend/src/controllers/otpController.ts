import { Request, Response } from "express";
import { EmailOtpDao } from "../daos/EmailOtpDao";
import { UserDao } from "../daos/UserDao";
import { generateOtp, isValidEmail, sanitizeEmail } from "../utils/otpHelpers";
import { sendOtpEmail, sendPasswordResetEmail } from "../services/EmailService";
import { query } from "../db/db";
import bcrypt from "bcrypt";


export const sendVerificationOtp = async (req: Request, res: Response) => {
  try {
    const { email, account_type } = req.body;

    // Validation
    if (!email || !account_type) {
      return res.status(400).json({
        success: false,
        message: "Email and account_type are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!["user", "seller"].includes(account_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account_type. Must be 'user' or 'seller'",
      });
    }

    // Check if account exists (all account types are users now)
    const account = await UserDao.findUserByEmail(email);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // Check if already verified
    if (account.is_verified_email) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // Check rate limit
    const canRequest = await EmailOtpDao.canRequestOtp(email, account_type);
    if (!canRequest) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again in an hour",
      });
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
      console.error(`❌ Failed to send OTP email to ${sanitizeEmail(email)}`);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again",
      });
    }

    console.log(`📧 Verification OTP sent to ${sanitizeEmail(email)}`);

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Send verification OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification code",
    });
  }
};

export const verifyEmailOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, account_type } = req.body;

    if (!email || !otp || !account_type) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and account_type are required",
      });
    }

    if (!["user", "seller"].includes(account_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account_type",
      });
    }

    const isValid = await EmailOtpDao.verifyOtp(
      email,
      otp,
      account_type,
      "email_verification",
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Update email verification status
    await query("UPDATE users SET is_verified_email = TRUE WHERE email = $1", [
      email,
    ]);

    // Clean up used OTPs
    await EmailOtpDao.deleteOtpsByEmail(email, account_type);

    console.log(`✅ Email verified for ${sanitizeEmail(email)}`);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email, account_type } = req.body;

    if (!email || !account_type) {
      return res.status(400).json({
        success: false,
        message: "Email and account_type are required",
      });
    }

    if (!["user", "seller", "admin"].includes(account_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account_type",
      });
    }

    const canRequest = await EmailOtpDao.canRequestOtp(email, account_type);
    if (!canRequest) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again in an hour",
      });
    }

    const account = await UserDao.findUserByEmail(email);

    if (!account) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a reset code has been sent",
      });
    }

    const otp = generateOtp();
    await EmailOtpDao.createOtp(email, otp, account_type, "password_reset");

    // Send email
    const emailSent = await sendPasswordResetEmail(email, otp, account.name);

    console.log(`📧 Password reset OTP sent to ${sanitizeEmail(email)}`);

    res.status(200).json({
      success: true,
      message: "If the email exists, a reset code has been sent",
    });
  } catch (error) {
    console.error("Request password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request",
    });
  }
};


export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, new_password, account_type } = req.body;

    if (!email || !otp || !new_password || !account_type) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const isValid = await EmailOtpDao.verifyOtp(
      email,
      otp,
      account_type,
      "password_reset",
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);

    await EmailOtpDao.deleteOtpsByEmail(email, account_type);

    console.log(`✅ Password reset for ${sanitizeEmail(email)}`);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};
