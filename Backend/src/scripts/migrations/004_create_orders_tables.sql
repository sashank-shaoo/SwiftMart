-- Migration Script: Create Orders and Order Items Tables
-- This script creates the orders and order_items tables for the checkout system


CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  payment_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status VARCHAR(20) DEFAULT 'processing' 
    CHECK (order_status IN ('processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  shipping_address JSONB NOT NULL,
  billing_address JSONB DEFAULT '{"city": "New Delhi", "state": "Delhi", "country": "India"}'::JSONB,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE RESTRICT
);

-- Create indexes for performance
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_seller ON order_items(seller_id);

-- Add comments
COMMENT ON TABLE orders IS 'Main order records for customers';
COMMENT ON TABLE order_items IS 'Line items for each order, capturing price at time of purchase';
