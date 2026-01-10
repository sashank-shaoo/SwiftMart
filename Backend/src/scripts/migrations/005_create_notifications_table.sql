-- Migration Script: Create Admin Notifications Table
-- This script creates the table for tracking notices that admins need to take action on

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- e.g., 'SELLER_REGISTRATION', 'SELLER_MIGRATION'
  message TEXT NOT NULL,
  metadata JSONB, -- Stores extra info like seller_id, user_id, etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX idx_notifications_type ON admin_notifications(type);
CREATE INDEX idx_notifications_is_read ON admin_notifications(is_read);

-- Add comment
COMMENT ON TABLE admin_notifications IS 'Notices and notifications for administrative tasks';
