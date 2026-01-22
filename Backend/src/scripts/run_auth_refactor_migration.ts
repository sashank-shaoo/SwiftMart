/**
 * Migration Runner: Refactor Authentication Architecture
 *
 * This script migrates the database from the old architecture (separate users, sellers, admins tables)
 * to the new unified architecture (users table + seller_profiles + admin_profiles)
 *
 * Run this script with: npx ts-node src/scripts/run_auth_refactor_migration.ts
 */

import { pool } from "../db/db";
import * as fs from "fs";
import * as path from "path";

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log(
      "🚀 Starting Authentication Architecture Refactor Migration...\n",
    );

    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "009_refactor_auth_architecture.sql",
    );

    console.log(`📄 Reading migration file: ${migrationPath}`);
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    // Begin transaction
    console.log("\n📦 Starting transaction...");
    await client.query("BEGIN");

    // Execute migration
    console.log("⚡ Executing migration SQL...\n");
    await client.query(migrationSQL);

    // Commit transaction
    console.log("\n✅ Migration executed successfully!");
    await client.query("COMMIT");

    // Verify the migration
    console.log("\n🔍 Verifying migration results...\n");

    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'seller_profiles', 'admin_profiles', 'sellers', 'admins')
      ORDER BY table_name;
    `);

    console.log("📊 Existing tables:");
    tableCheck.rows.forEach((row) => {
      const status =
        row.table_name === "sellers" || row.table_name === "admins"
          ? "❌ (should be deleted)"
          : "✅";
      console.log(`   ${status} ${row.table_name}`);
    });

    const userCount = await client.query("SELECT COUNT(*) as count FROM users");
    const sellerProfileCount = await client.query(
      "SELECT COUNT(*) as count FROM seller_profiles",
    );
    const adminProfileCount = await client.query(
      "SELECT COUNT(*) as count FROM admin_profiles",
    );

    console.log("\n📈 Record counts:");
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Seller Profiles: ${sellerProfileCount.rows[0].count}`);
    console.log(`   Admin Profiles: ${adminProfileCount.rows[0].count}`);

    const roleDistribution = await client.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role;
    `);

    console.log("\n👥 User role distribution:");
    roleDistribution.rows.forEach((row) => {
      console.log(`   ${row.role}: ${row.count}`);
    });

    console.log("\n✨ Migration completed successfully!");
    console.log("\n⚠️  IMPORTANT NEXT STEPS:");
    console.log(
      "   1. Update your application code to use the new UserDao and profile DAOs",
    );
    console.log(
      "   2. Test all authentication flows (login, registration, etc.)",
    );
    console.log("   3. Verify seller and admin functionalities work correctly");
    console.log("   4. Remove old SellerDao.ts and AdminDao.ts files");
    console.log(
      "   5. Update any references to the old Seller and Admin models\n",
    );
  } catch (error) {
    console.error("\n❌ Migration failed! Rolling back changes...");
    await client.query("ROLLBACK");
    console.error("\nError details:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log("🎉 Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("💥 Fatal error:", err);
    process.exit(1);
  });
