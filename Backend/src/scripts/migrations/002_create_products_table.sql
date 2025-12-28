-- Migration Script: Create Products Table
-- This script drops the old items table and creates the new products table

-- Drop existing tables that depend on items
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS items CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  category_id UUID NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  images JSONB[] NOT NULL,
  attributes JSONB,
  seller_id UUID,
  season VARCHAR(20) CHECK (season IN ('summer', 'winter', 'spring', 'autumn', 'monsoon', 'rainy')),
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key to categories table
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  
  -- Foreign key to sellers table (if exists)
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_season ON products(season);

-- Add comment to table
COMMENT ON TABLE products IS 'Product catalog with comprehensive attributes and pricing';
