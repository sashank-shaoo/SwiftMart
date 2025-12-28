-- Migration Script: Create Categories Table with Hierarchical Structure
-- This script drops and recreates the categories table

-- Drop existing table if exists
DROP TABLE IF EXISTS categories CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Self-referential foreign key for hierarchical categories
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Add comment to table
COMMENT ON TABLE categories IS 'Product categories with hierarchical parent-child relationships';
