import dotenv from "dotenv";
dotenv.config();
import { query } from "../../db/db";

/**
 * Add delivery tracking fields to orders table
 * and warehouse_location to seller_profiles
 */
async function addDeliveryTracking() {
  console.log("🚚 Adding delivery tracking to orders table...\n");

  try {
    // Add delivery tracking fields to orders table
    console.log("📋 Adding delivery tracking columns to orders...");

    await query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS delivery_distance_km DECIMAL(10, 2)
    `);

    console.log("✅ Delivery tracking columns added to orders table!");

    // Add warehouse location to seller_profiles
    console.log("\n📍 Adding warehouse_location to seller_profiles...");

    await query(`
      ALTER TABLE seller_profiles
      ADD COLUMN IF NOT EXISTS warehouse_location VARCHAR(255)
    `);

    console.log("✅ warehouse_location column added to seller_profiles!");

    // Add indexes for better query performance
    console.log("\n🔍 Creating indexes...");

    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON orders(shipped_at)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_estimated_delivery ON orders(estimated_delivery_time)
    `);

    console.log("✅ Indexes created!");

    // Add comments for documentation
    console.log("\n📝 Adding column comments...");

    await query(`
      COMMENT ON COLUMN orders.shipped_at IS 'Timestamp when order was marked as shipped by seller'
    `);

    await query(`
      COMMENT ON COLUMN orders.estimated_delivery_time IS 'Calculated ETA based on distance (dynamic formula)'
    `);

    await query(`
      COMMENT ON COLUMN orders.delivery_distance_km IS 'Distance in km between seller warehouse and customer address'
    `);

    await query(`
      COMMENT ON COLUMN seller_profiles.warehouse_location IS 'Seller warehouse coordinates in format: lat,lng'
    `);

    console.log("✅ Comments added!");

    // Verify the changes
    console.log("\n📋 Verifying changes...");

    const ordersColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
        AND column_name IN ('shipped_at', 'estimated_delivery_time', 'delivery_distance_km')
      ORDER BY column_name
    `);

    console.log("\nOrders table new columns:");
    ordersColumns.rows.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    const sellerColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'seller_profiles' 
        AND column_name = 'warehouse_location'
    `);

    console.log("\nSeller profiles new columns:");
    sellerColumns.rows.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    console.log("\n✅ Migration completed successfully!\n");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error running migration:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

// Run the migration
addDeliveryTracking();
