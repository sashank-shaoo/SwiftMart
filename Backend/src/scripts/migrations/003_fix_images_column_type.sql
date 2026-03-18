-- Fix images column type from JSONB[] to text[]
-- Run this to update existing products table

-- Backup existing data if any
-- CREATE TABLE products_backup AS SELECT * FROM products;

-- Alter the column type
ALTER TABLE products 
ALTER COLUMN images TYPE text[] 
USING images::text[];

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'images';
