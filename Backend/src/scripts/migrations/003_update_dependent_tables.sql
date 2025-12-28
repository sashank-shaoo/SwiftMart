-- Migration Script: Update Dependent Tables
-- This script recreates carts and reviews tables to reference products instead of items

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create reviews table with product_id
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for reviews
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Add comment to table
COMMENT ON TABLE reviews IS 'Product reviews from users';

-- Create carts table with product_id
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_time NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

-- Prevent a user from adding the same product twice
CREATE UNIQUE INDEX unique_user_product_cart ON carts (user_id, product_id);

-- Create additional indexes for carts
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_product ON carts(product_id);
CREATE INDEX idx_carts_seller ON carts(seller_id);

-- Add comment to table
COMMENT ON TABLE carts IS 'User shopping carts with products';
