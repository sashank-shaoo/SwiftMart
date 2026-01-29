-- Migration Script: Payment and Revenue Split
-- This script adds the transactions table and revenue tracking fields

-- 1. Create transactions table to track revenue splits
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  seller_amount DECIMAL(10, 2) NOT NULL,
  platform_amount DECIMAL(10, 2) NOT NULL, -- Commission/Revenue for admin
  commission_rate DECIMAL(5, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed' 
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 2. Add revenue tracking fields to seller_profiles
ALTER TABLE seller_profiles 
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS current_balance DECIMAL(15, 2) DEFAULT 0.00;

-- 3. Add revenue tracking fields to admin_profiles
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(15, 2) DEFAULT 0.00;

-- 4. Create indexes
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);

-- Add comments
COMMENT ON TABLE transactions IS 'Split of payment between seller and platform for each order';
COMMENT ON COLUMN seller_profiles.total_earnings IS 'Lifetime earnings for the seller';
COMMENT ON COLUMN seller_profiles.current_balance IS 'Available balance for the seller to withdraw';
COMMENT ON COLUMN admin_profiles.total_revenue IS 'Total commission earned by the platform from this admin''s managed area';
