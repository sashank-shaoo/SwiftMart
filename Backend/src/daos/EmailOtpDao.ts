import { query } from "../db/db";
import { EmailOtp } from "../models/emailOtp";
import bcrypt from "bcrypt";

export class EmailOtpDao {
  static async createOtp(
    email: string,
    otp: string,
    accountType: "user" | "seller" | "admin",
    purpose: "email_verification" | "password_reset" | "email_change"
  ): Promise<EmailOtp> {
    const otpHash = await bcrypt.hash(otp, 10);
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

  static async verifyOtp(
    email: string,
    otp: string,
    accountType: "user" | "seller" | "admin",
    purpose: "email_verification" | "password_reset" | "email_change"
  ): Promise<boolean> {
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
      return false;
    }

    const otpRecord = res.rows[0];
    const isValid = await bcrypt.compare(otp, otpRecord.otp_hash);
     //preventing brute force attack
    await query("UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1", [
      otpRecord.id,
    ]);

    if (isValid) {
      await query("UPDATE email_otps SET is_used = TRUE WHERE id = $1", [
        otpRecord.id,
      ]);
      return true;
    }

    return false;
  }

  static async canRequestOtp(
    email: string,
    accountType: "user" | "seller" | "admin"
  ): Promise<boolean> {
    const text = `
      SELECT COUNT(*) as count
      FROM email_otps
      WHERE email = $1 
        AND account_type = $2
        AND created_at > NOW() - INTERVAL '1 hour'
    `;

    const res = await query(text, [email, accountType]);
    const count = parseInt(res.rows[0].count);

    return count < 3;
  }

  static async cleanupExpiredOtps(): Promise<number> {
    const text = `
      DELETE FROM email_otps 
      WHERE is_used = TRUE 
         OR expires_at < NOW() - INTERVAL '10 minutes'
      RETURNING id
    `;

    const res = await query(text);
    return res.rows.length;
  }
  
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
