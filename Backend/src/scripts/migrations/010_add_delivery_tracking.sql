-- Migration: Add Delivery Tracking to Orders
-- Adds fields for tracking shipment status, delivery estimates, and distance calculations

-- Add delivery tracking fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivery_distance_km DECIMAL(10, 2);

-- Add warehouse location to seller_profiles if not exists
-- (This ensures we calculate from seller's warehouse, not inventory location)
ALTER TABLE seller_profiles
ADD COLUMN IF NOT EXISTS warehouse_location VARCHAR(255);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON orders(shipped_at);
CREATE INDEX IF NOT EXISTS idx_orders_estimated_delivery ON orders(estimated_delivery_time);

-- Add comments for documentation
COMMENT ON COLUMN orders.shipped_at IS 'Timestamp when order was marked as shipped by seller';
COMMENT ON COLUMN orders.estimated_delivery_time IS 'Calculated ETA based on distance (8 min/km formula)';
COMMENT ON COLUMN orders.delivery_distance_km IS 'Distance in km between seller warehouse and customer address';
COMMENT ON COLUMN seller_profiles.warehouse_location IS 'Seller warehouse coordinates in format: lat,lng';
