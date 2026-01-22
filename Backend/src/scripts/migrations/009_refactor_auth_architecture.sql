-- Migration Script: Refactor Authentication Architecture
-- This migration consolidates authentication in users table and converts sellers/admins to profile extensions
-- Version: 009
-- Author: System Refactor
-- Date: 2026-01-21

-- ===========================================
-- STEP 1: Create New Profile Tables
-- ===========================================

-- Create seller_profiles table (business data only, no auth fields)
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
  
  -- Foreign key will be added after data migration
  CONSTRAINT fk_seller_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create admin_profiles table (admin-specific data only, no auth fields)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  permissions JSONB DEFAULT '{}',
  department VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key will be added after data migration
  CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===========================================
-- STEP 2: Update Users Table
-- ===========================================

-- Add role column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role VARCHAR(10) DEFAULT 'user' 
    CHECK (role IN ('user', 'seller', 'admin'));
  END IF;
END $$;

-- ===========================================
-- STEP 3: Migrate Sellers Data
-- ===========================================

-- Check if sellers table exists before migration
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sellers') THEN
    
    -- Migrate sellers to users table and create seller_profiles
    -- Handle potential email conflicts (use seller data if both exist)
    INSERT INTO users (id, name, image, number, location, email, password, role, is_verified_email, refresh_token_hash, refresh_token_expires_at, created_at, updated_at)
    SELECT 
      s.id,
      s.name,
      s.image,
      s.number,
      s.location,
      s.email,
      s.password,
      'seller' as role,
      s.is_verified_email,
      s.refresh_token_hash,
      s.refresh_token_expires_at,
      s.created_at,
      s.updated_at
    FROM sellers s
    WHERE NOT EXISTS (
      SELECT 1 FROM users u WHERE u.email = s.email
    );
    
    -- For sellers whose email already exists in users, update the user to seller role
    -- and create profile linking
    UPDATE users u
    SET 
      role = 'seller',
      updated_at = CURRENT_TIMESTAMP
    FROM sellers s
    WHERE u.email = s.email AND u.role = 'user';
    
    -- Create seller_profiles for migrated sellers
    INSERT INTO seller_profiles (user_id, store_name, verification_status, created_at, updated_at)
    SELECT 
      u.id as user_id,
      COALESCE(s.name, u.name) as store_name,
      CASE 
        WHEN COALESCE(s.is_seller_verified, false) = true THEN 'verified'
        ELSE 'pending'
      END as verification_status,
      s.created_at,
      s.updated_at
    FROM sellers s
    JOIN users u ON u.email = s.email
    WHERE NOT EXISTS (
      SELECT 1 FROM seller_profiles sp WHERE sp.user_id = u.id
    );
    
  END IF;
END $$;

-- ===========================================
-- STEP 4: Migrate Admins Data
-- ===========================================

-- Check if admins table exists before migration
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') THEN
    
    -- Migrate admins to users table and create admin_profiles
    INSERT INTO users (id, name, number, email, password, role, refresh_token_hash, refresh_token_expires_at, created_at, updated_at)
    SELECT 
      a.id,
      a.name,
      a.number,
      a.email,
      a.password,
      'admin' as role,
      a.refresh_token_hash,
      a.refresh_token_expires_at,
      a.created_at,
      a.updated_at
    FROM admins a
    WHERE NOT EXISTS (
      SELECT 1 FROM users u WHERE u.email = a.email
    );
    
    -- For admins whose email already exists in users, update to admin role
    UPDATE users u
    SET 
      role = 'admin',
      updated_at = CURRENT_TIMESTAMP
    FROM admins a
    WHERE u.email = a.email;
    
    -- Create admin_profiles for migrated admins
    INSERT INTO admin_profiles (user_id, created_at, updated_at)
    SELECT 
      u.id as user_id,
      a.created_at,
      a.updated_at
    FROM admins a
    JOIN users u ON u.email = a.email
    WHERE NOT EXISTS (
      SELECT 1 FROM admin_profiles ap WHERE ap.user_id = u.id
    );
    
  END IF;
END $$;

-- ===========================================
-- STEP 5: Update Foreign Keys in Dependent Tables
-- ===========================================

-- Update products table to use seller's user_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    
    -- Add temp column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'seller_user_id'
    ) THEN
      ALTER TABLE products ADD COLUMN seller_user_id UUID;
    END IF;
    
    -- Update seller_user_id to match the user_id from seller_profiles
    UPDATE products p
    SET seller_user_id = sp.user_id
    FROM seller_profiles sp
    WHERE p.seller_id = sp.user_id OR 
          p.seller_id IN (
            SELECT s.id FROM sellers s 
            JOIN users u ON s.email = u.email 
            WHERE u.id = sp.user_id
          );
    
    -- Make it NOT NULL after populating
    ALTER TABLE products ALTER COLUMN seller_user_id SET NOT NULL;
    
    -- Drop old foreign key constraint if exists
    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;
    
    -- Drop old seller_id column
    ALTER TABLE products DROP COLUMN IF EXISTS seller_id;
    
    -- Rename seller_user_id to seller_id
    ALTER TABLE products RENAME COLUMN seller_user_id TO seller_id;
    
    -- Add new foreign key constraint
    ALTER TABLE products ADD CONSTRAINT products_seller_id_fkey 
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE;
    
  END IF;
END $$;

-- ===========================================
-- STEP 6: Drop Old Tables (CAREFUL!)
-- ===========================================

-- Drop sellers table (if it exists)
DROP TABLE IF EXISTS sellers CASCADE;

-- Drop admins table (if it exists)
DROP TABLE IF EXISTS admins CASCADE;

-- ===========================================
-- STEP 7: Create Indexes for Performance
-- ===========================================

-- Index on users.role for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index on users.email for faster login queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index on seller_profiles.user_id (already unique, but helpful)
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);

-- Index on admin_profiles.user_id (already unique, but helpful)
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);

-- Index on seller_profiles.verification_status
CREATE INDEX IF NOT EXISTS idx_seller_profiles_verification_status ON seller_profiles(verification_status);

-- ===========================================
-- STEP 8: Add Comments for Documentation
-- ===========================================

COMMENT ON TABLE seller_profiles IS 'Seller business information - separated from authentication which lives in users table';
COMMENT ON TABLE admin_profiles IS 'Admin-specific information - separated from authentication which lives in users table';
COMMENT ON COLUMN users.role IS 'User role: user (regular customer), seller (can sell products), admin (platform administrator)';
COMMENT ON COLUMN seller_profiles.verification_status IS 'Seller verification status: pending, verified, or rejected';
COMMENT ON COLUMN seller_profiles.payout_details IS 'JSON object containing bank account, UPI, or other payout information';
COMMENT ON COLUMN seller_profiles.commission_rate IS 'Commission percentage charged to this seller (0-100)';
COMMENT ON COLUMN admin_profiles.permissions IS 'JSON object containing admin permission flags';

-- Migration complete!
-- Users table now contains all authentication
-- seller_profiles and admin_profiles contain business/role-specific data only
