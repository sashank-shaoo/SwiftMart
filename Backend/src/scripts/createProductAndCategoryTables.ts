import { readFileSync } from "fs";
import { join } from "path";
import pool, { query } from "../db/db";

async function runMigrations() {
  try {
    console.log("Starting database migrations...\n");

    // Migration scripts in order
    const migrations = [
      "001_create_categories_table.sql",
      "002_create_products_table.sql",
      "003_update_dependent_tables.sql",
      "004_create_orders_tables.sql",
      "005_create_notifications_table.sql",
      "006_create_inventory_table.sql",
      "007_create_wishlist_table.sql",
    ];

    for (const migration of migrations) {
      const migrationPath = join(__dirname, "migrations", migration);
      console.log(`Running migration: ${migration}`);

      try {
        const sql = readFileSync(migrationPath, "utf-8");
        await query(sql);
        console.log(`✓ ${migration} completed successfully\n`);
      } catch (error) {
        console.error(`✗ Error running ${migration}:`, error);
        throw error;
      }
    }

    console.log("All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the database connection pool
    await pool.end();
  }
}

// Run migrations
runMigrations();
