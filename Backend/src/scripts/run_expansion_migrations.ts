import { readFileSync } from "fs";
import { join } from "path";
import { query, pool } from "../db/db";
import * as dotenv from "dotenv";

dotenv.config({ path: join(__dirname, "../../.env") });

async function runExpansionMigrations() {
  try {
    console.log("Starting expansion migrations (Inventory & Wishlist)...\n");

    const migrations = [
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
      } catch (error: any) {
        if (error.code === "42P07") {
          console.log(`⚠ ${migration} skipped: Table already exists.\n`);
        } else {
          console.error(`✗ Error running ${migration}:`, error);
          throw error;
        }
      }
    }

    console.log("Expansion migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

runExpansionMigrations();
