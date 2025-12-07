import { query } from "../db/db";
import { EmailOtp } from "../models/emailOtp";
import bcrypt from "bcrypt";

export class EmailOtpDao {
  /**
   * Create a new OTP record in the database
   * OTP is hashed before storage for security
   */
  static async createOtp(
    email: string,
    otp: string,
    accountType: "user" | "seller" | "admin",
    purpose: "email_verification" | "password_reset" | "email_change"
  ): Promise<EmailOtp> {
    // Hash the OTP before storing (security best practice)
    const otpHash = await bcrypt.hash(otp, 10);

    // OTP expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const text = `
      INSERT INTO email_otps (email, account_type, otp_hash, purpose, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [email, accountType, otpHash, purpose, expiresAt];
    const res = await query(text, values);

    return res.rows[0];
  }

  /**
   * Verify an OTP against the stored hash
   * Returns true if valid, false otherwise
   */
  static async verifyOtp(
    email: string,
    otp: string,
    accountType: "user" | "seller" | "admin",
    purpose: "email_verification" | "password_reset" | "email_change"
  ): Promise<boolean> {
    // Get the latest unused OTP for this email/account_type/purpose
    const text = `
      SELECT * FROM email_otps
      WHERE email = $1 
        AND account_type = $2
        AND purpose = $3
        AND is_used = FALSE
        AND expires_at > NOW()
        AND attempts < 5
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const res = await query(text, [email, accountType, purpose]);

    if (res.rows.length === 0) {
      return false; // No valid OTP found
    }

    const otpRecord = res.rows[0];

    // Verify the OTP against the hash
    const isValid = await bcrypt.compare(otp, otpRecord.otp_hash);

    // Increment attempts counter (prevent brute force)
    await query("UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1", [
      otpRecord.id,
    ]);

    if (isValid) {
      // Mark OTP as used (single-use only)
      await query("UPDATE email_otps SET is_used = TRUE WHERE id = $1", [
        otpRecord.id,
      ]);
      return true;
    }

    return false;
  }

  /**
   * Check if user has exceeded OTP request rate limit
   * Returns true if user can request OTP, false if rate limited
   */
  static async canRequestOtp(
    email: string,
    accountType: "user" | "seller" | "admin"
  ): Promise<boolean> {
    // Check how many OTPs were created in the last hour
    const text = `
      SELECT COUNT(*) as count
      FROM email_otps
      WHERE email = $1 
        AND account_type = $2
        AND created_at > NOW() - INTERVAL '1 hour'
    `;

    const res = await query(text, [email, accountType]);
    const count = parseInt(res.rows[0].count);

    // Allow max 3 OTP requests per hour
    return count < 3;
  }

  /**
   * Clean up expired or used OTPs
   * Should be run periodically (e.g., via cron job)
   */
  static async cleanupExpiredOtps(): Promise<number> {
    const text = `
      DELETE FROM email_otps 
      WHERE expires_at < NOW() OR is_used = TRUE
      RETURNING id
    `;

    const res = await query(text);
    return res.rows.length; // Return count of deleted records
  }

  /**
   * Delete all OTPs for a specific email (e.g., after successful verification)
   */
  static async deleteOtpsByEmail(
    email: string,
    accountType: "user" | "seller" | "admin"
  ): Promise<void> {
    const text = `
      DELETE FROM email_otps 
      WHERE email = $1 AND account_type = $2
    `;

    await query(text, [email, accountType]);
  }
}
