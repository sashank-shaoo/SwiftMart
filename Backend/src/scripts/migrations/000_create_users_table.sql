-- Migration Script: Create Base Users Table
-- This MUST run before migration 009
-- Creates the foundational users table for authentication

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create users table (base authentication table)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  number VARCHAR(20),
  image VARCHAR(500),
  location GEOMETRY(Point, 4326),
  is_verified_email BOOLEAN DEFAULT FALSE,
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
  refresh_token_hash VARCHAR(255),
  refresh_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(location);

-- Add comments
COMMENT ON TABLE users IS 'Base authentication table for all users (customers, sellers, admins)';
COMMENT ON COLUMN users.role IS 'User role: user (customer), seller (can sell products), admin (platform admin)';
COMMENT ON COLUMN users.location IS 'User location as PostGIS point geometry';
