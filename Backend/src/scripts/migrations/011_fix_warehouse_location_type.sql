-- Migration Script: Fix Warehouse Location Column Type
-- Changes warehouse_location from VARCHAR to GEOMETRY to match users table

-- 1. Drop the existing column (since it likely has invalid data or we want to start fresh)
--    If we wanted to preserve data, we would need to convert it, but since it's failing anyway, dropping is safer.
ALTER TABLE seller_profiles DROP COLUMN IF EXISTS warehouse_location;

-- 2. Add the column again with correct type
ALTER TABLE seller_profiles ADD COLUMN warehouse_location GEOMETRY(Point, 4326);

-- 3. Add index for spatial queries
CREATE INDEX IF NOT EXISTS idx_seller_profiles_warehouse_location ON seller_profiles USING GIST(warehouse_location);

-- 4. Add comment
COMMENT ON COLUMN seller_profiles.warehouse_location IS 'Seller warehouse location as PostGIS point geometry';
