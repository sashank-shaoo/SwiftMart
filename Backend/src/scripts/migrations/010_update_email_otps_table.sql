-- Migration Script: Update email_otps table
-- Adds missing columns required by EmailOtpDao implementation

ALTER TABLE email_otps 
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) NOT NULL DEFAULT 'user',
ADD COLUMN IF NOT EXISTS otp_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS purpose VARCHAR(50) NOT NULL DEFAULT 'email_verification',
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN otp DROP NOT NULL;

-- Add index for performance in verifyOtp
CREATE INDEX IF NOT EXISTS idx_email_otps_lookup ON email_otps (email, account_type, purpose, is_used, expires_at);

-- Add comments
COMMENT ON COLUMN email_otps.account_type IS 'Role of the person requesting OTP: user, seller, admin';
COMMENT ON COLUMN email_otps.otp_hash IS 'BCrypt hashed OTP for security';
COMMENT ON COLUMN email_otps.purpose IS 'Purpose of OTP: email_verification, password_reset, email_change';
COMMENT ON COLUMN email_otps.attempts IS 'Number of failed verification attempts';
