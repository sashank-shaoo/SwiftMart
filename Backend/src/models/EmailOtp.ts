export interface EmailOtp {
  id?: string;
  email: string;
  account_type: "user" | "seller" | "admin";
  otp_hash: string;
  purpose: "email_verification" | "password_reset" | "email_change";
  expires_at: Date;
  attempts?: number;
  is_used?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
