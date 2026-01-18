-- Migration Script: Upgrade Inventory Table to Full Option 2
-- This adds missing fields for better inventory management

-- Drop the old inventory table if it exists (careful in production!)
DROP TABLE IF EXISTS inventory CASCADE;

-- Create the upgraded inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE,
  
  -- Stock tracking
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  
  -- Auto-calculated available stock (stock - reserved)
  available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
  
  -- Inventory management
  low_stock_threshold INTEGER DEFAULT 5 CHECK (low_stock_threshold >= 0),
  warehouse_location VARCHAR(255),
  last_restocked_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key to products table
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes for faster lookup
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_low_stock ON inventory(available_quantity) WHERE available_quantity <= low_stock_threshold;

-- Add comments
COMMENT ON TABLE inventory IS 'Real-time stock tracking with auto-calculated availability';
COMMENT ON COLUMN inventory.available_quantity IS 'Auto-calculated: stock_quantity - reserved_quantity';
COMMENT ON COLUMN inventory.low_stock_threshold IS 'Alert threshold for low stock warnings';
