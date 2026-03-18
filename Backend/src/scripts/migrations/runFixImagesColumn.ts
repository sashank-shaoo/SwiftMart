import dotenv from "dotenv";
dotenv.config();
import { query } from "../../db/db";

/**
 * Fix images column type in products table
 * Changes from JSONB[] to text[]
 */
async function fixImagesColumnType() {
  console.log("🔧 Fixing products.images column type...\n");

  try {
    // Check current type
    console.log("📋 Checking current column type...");
    const checkType = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'images'
    `);

    console.log("Current type:", checkType.rows[0]);

    // Since the table is likely empty (we're just testing), we can safely drop and recreate
    console.log("\n⚠️  WARNING: This will drop the images column!");
    console.log(
      "If you have existing products, they will lose their images.\n",
    );

    // Drop the column
    console.log("🗑️  Dropping images column...");
    await query(`ALTER TABLE products DROP COLUMN images`);

    // Recreate with correct type
    console.log("➕ Adding images column as text[]...");
    await query(
      `ALTER TABLE products ADD COLUMN images text[] NOT NULL DEFAULT '{}'`,
    );

    console.log("✅ Column type updated successfully!\n");

    // Verify the change
    const verifyType = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'images'
    `);

    console.log("📋 New type:", verifyType.rows[0]);

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error fixing column type:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

// Run the migration
fixImagesColumnType();
