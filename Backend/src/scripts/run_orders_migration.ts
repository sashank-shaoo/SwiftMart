import { readFileSync } from "fs";
import { join } from "path";
import { query, pool } from "../db/db";
import * as dotenv from "dotenv";

dotenv.config({ path: join(__dirname, "../../.env") });

async function runOrdersMigration() {
  try {
    const migrationPath = join(
      __dirname,
      "migrations",
      "004_create_orders_tables.sql"
    );
    console.log(`Running migration: 004_create_orders_tables.sql`);
    const sql = readFileSync(migrationPath, "utf-8");
    await query(sql);
    console.log(`✓ 004_create_orders_tables.sql completed successfully`);
  } catch (error) {
    console.error(`✗ Error:`, error);
  } finally {
    await pool.end();
  }
}

runOrdersMigration();
