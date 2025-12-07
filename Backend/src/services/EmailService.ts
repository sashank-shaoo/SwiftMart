import nodemailer from "nodemailer";
import {
  getOtpEmailTemplate,
  getOtpEmailPlainText,
} from "../utils/emailTemplates";

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Send OTP verification email with retry logic
 */
export async function sendOtpEmail(
  email: string,
  otp: string,
  name?: string,
  purpose: "verification" | "password_reset" | "email_change" = "verification"
): Promise<boolean> {
  const subjects = {
    verification: "Verify Your Email - SwiftMart",
    password_reset: "Reset Your Password - SwiftMart",
    email_change: "Confirm Email Change - SwiftMart",
  };

  const mailOptions = {
    from: process.env.FROM_EMAIL || process.env.MAIL_USER,
    to: email,
    subject: subjects[purpose],
    html: getOtpEmailTemplate(otp, name, purpose),
    text: getOtpEmailPlainText(otp, name, purpose),
  };

  console.log(`📧 Attempting to send OTP email to ${email}...`);
  console.log(`  Purpose: ${purpose}`);
  console.log(`  OTP: ${otp}`);

  // First attempt
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully (${purpose}):`, info.messageId);
    return true;
  } catch (error) {
    console.error("❌ First attempt failed:", error);
    console.log("🔄 Retrying...");

    // Second attempt (retry)
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent on retry (${purpose}):`, info.messageId);
      return true;
    } catch (retryError) {
      console.error("❌ Both attempts failed!");
      console.error("Retry error:", retryError);
      return false;
    }
  }
}

/**
 * Send password reset email (alias for sendOtpEmail with password_reset purpose)
 */
export async function sendPasswordResetEmail(
  email: string,
  otp: string,
  name?: string
): Promise<boolean> {
  return sendOtpEmail(email, otp, name, "password_reset");
}

/**
 * Send email change confirmation email
 */
export async function sendEmailChangeEmail(
  email: string,
  otp: string,
  name?: string
): Promise<boolean> {
  return sendOtpEmail(email, otp, name, "email_change");
}

/**
 * Generic email sending function (for other uses)
 */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.MAIL_USER,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return false;
  }
}

export default sendEmail;
