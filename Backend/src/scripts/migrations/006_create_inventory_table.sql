-- Migration Script: Create Inventory Table
-- This script separates stock management from the product catalog for better scalability

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE,
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key to products table
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Index for faster lookup
CREATE INDEX idx_inventory_product_id ON inventory(product_id);

-- Add comment to table
COMMENT ON TABLE inventory IS 'Real-time stock tracking for products';
