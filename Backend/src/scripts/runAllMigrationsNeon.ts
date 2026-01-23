import "dotenv/config";
import { query } from "../db/db";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * FIXED Migration Runner for Neon PostgreSQL (v2)
 *
 * Added 000_create_users_table.sql to fix dependency issue
 */

const migrations = [
  // STEP 0: Create base users table (NEW - CRITICAL!)
  "000_create_users_table.sql", // Creates: users table (MUST BE FIRST!)

  // STEP 1: Create auth profiles (now safe - users exists)
  "009_refactor_auth_architecture.sql", // Creates: seller_profiles, admin_profiles (migrates old data)

  // STEP 2: Create independent tables
  "001_create_categories_table.sql", // Creates: categories
  "005_create_notifications_table.sql", // Creates: admin_notifications

  // STEP 3: Create products (requires: categories, users)
  "002_create_products_table.sql", // Creates: products

  // STEP 4: Create product-dependent tables
  "006_create_inventory_table.sql", // Creates: inventory (basic)
  "008_update_inventory_table.sql", // Upgrades: inventory (full)

  // STEP 5: Create tables needing users + products
  "003_update_dependent_tables.sql", // Creates: carts, reviews
  "004_create_orders_tables.sql", // Creates: orders, order_items
  "007_create_wishlist_table.sql", // Creates: wishlists

  // STEP 6: Create utilities
  "otp_auto_cleanup.sql", // Creates: OTP cleanup function
];

async function runMigrations() {
  console.log("🚀 Starting Neon database migration...\n");
  console.log("📦 This will create 13 tables for your e-commerce backend\n");

  // Test connection
  try {
    const result = await query("SELECT NOW(), current_database()");
    console.log("✅ Connected to Neon PostgreSQL");
    console.log(`   Database: ${result.rows[0].current_database}`);
    console.log(`   Server time: ${result.rows[0].now}`);
    console.log(`   Region: ap-southeast-1 (Singapore)\n`);
  } catch (error: any) {
    console.error("❌ Failed to connect to Neon database\n");
    console.error(`   Error: ${error.message}\n`);
    console.log("💡 Troubleshooting:");
    console.log("   1. Check DATABASE_URL in .env");
    console.log("   2. Verify Neon database is active");
    console.log("   3. Check internet connection");
    console.log("   4. Ensure ?sslmode=require is in connection string\n");
    process.exit(1);
  }

  // Run each migration
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < migrations.length; i++) {
    const migrationFile = migrations[i];
    const stepNum = i + 1;

    try {
      console.log(
        `[${stepNum}/${migrations.length}] Running: ${migrationFile}`,
      );

      const migrationPath = join(__dirname, "migrations", migrationFile);
      const sql = readFileSync(migrationPath, "utf-8");

      await query(sql);
      console.log(`         ✅ Success\n`);
      successCount++;
    } catch (error: any) {
      // Check if it's an "already exists" error (safe to skip)
      if (error.message.includes("already exists")) {
        console.log(`         ⚠️  Already exists (skipping)\n`);
        skipCount++;
        continue;
      }

      // Log error but continue
      console.error(`         ❌ Error: ${error.message}\n`);
      errorCount++;

      // Only stop on critical errors
      if (
        error.message.includes("does not exist") ||
        error.message.includes("syntax error")
      ) {
        console.log("⏸️  Stopping migrations due to critical error\n");
        process.exit(1);
      }
    }
  }

  // Verify tables were created
  console.log("\n🔍 Verifying database schema...\n");
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("📊 Tables in SwiftMart_ecom database:\n");
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    console.log(`\n✨ Migration Summary:`);
    console.log(`   ✅ ${successCount} migrations successful`);
    console.log(`   ⚠️  ${skipCount} migrations skipped (already existed)`);
    console.log(`   ❌ ${errorCount} migrations with errors`);
    console.log(`   📊 ${result.rows.length} total tables`);

    if (result.rows.length >= 10) {
      console.log(`\n🎉 SUCCESS! Your Neon database is ready!`);
      console.log(`\n💡 Next steps:`);
      console.log(`   1. Test your backend: npm run dev`);
      console.log(`   2. Try registering a user`);
      console.log(`   3. Check Neon dashboard to see your data`);
    } else {
      console.log(
        `\n⚠️  Warning: Expected ~13 tables but found ${result.rows.length}`,
      );
      console.log(`   Some migrations may have failed. Check logs above.`);
    }
  } catch (error: any) {
    console.error("\n❌ Failed to verify tables:", error.message);
  }

  process.exit(0);
}

// Run migrations
console.log("═".repeat(60));
console.log("  NEON DATABASE MIGRATION (v2 - Fixed)");
console.log("  Added 000_create_users_table.sql");
console.log("═".repeat(60) + "\n");

runMigrations();
