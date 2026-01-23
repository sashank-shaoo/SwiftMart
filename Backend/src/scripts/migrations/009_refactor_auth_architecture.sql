-- Migration Script: Create Auth Profile Tables (Simplified for Fresh DB)
-- This creates seller and admin profiles WITHOUT migrating old data
-- Use this for fresh Neon deployment

-- ===========================================
-- STEP 1: Create Profile Tables
-- ===========================================

-- Create seller_profiles table
CREATE TABLE IF NOT EXISTS seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  store_name VARCHAR(255),
  gst_number VARCHAR(50),
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  payout_details JSONB,
  commission_rate DECIMAL(5,2) DEFAULT 10.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_seller_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  permissions JSONB DEFAULT '{}',
  department VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create email_otps table for OTP verification
CREATE TABLE IF NOT EXISTS email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- STEP 2: Create Indexes
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_verification_status ON seller_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_expires_at ON email_otps(expires_at);

-- ===========================================
-- STEP 3: Add Comments
-- ===========================================

COMMENT ON TABLE seller_profiles IS 'Seller business information - separated from authentication';
COMMENT ON TABLE admin_profiles IS 'Admin-specific information - separated from authentication';
COMMENT ON TABLE email_otps IS 'One-time passwords for email verification';
COMMENT ON COLUMN users.role IS 'User role: user (customer), seller (can sell), admin (platform admin)';
COMMENT ON COLUMN seller_profiles.verification_status IS 'Seller verification: pending, verified, or rejected';
COMMENT ON COLUMN seller_profiles.commission_rate IS 'Commission percentage (0-100)';
