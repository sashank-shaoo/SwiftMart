-- Seed Default Categories
-- This script inserts commonly used product categories into the categories table

INSERT INTO categories (name, slug) VALUES
('Electronics', 'electronics'),
('Fashion & Apparel', 'fashion'),
('Home & Garden', 'home-garden'),
('Sports & Outdoors', 'sports-outdoors'),
('Books & Media', 'books-media'),
('Toys & Games', 'toys-games'),
('Health & Beauty', 'health-beauty'),
('Food & Beverages', 'food-beverages'),
('Automotive', 'automotive'),
('Office Supplies', 'office-supplies')
ON CONFLICT (slug) DO NOTHING;

-- Display inserted categories
SELECT * FROM categories ORDER BY name;
