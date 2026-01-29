import * as dotenv from "dotenv";
import { join } from "path";
import { readFileSync } from "fs";

dotenv.config({ path: join(__dirname, "../../.env") });

async function runPaymentMigration() {
  const { default: pool, query } = await import("../db/db");
  try {
    const migrationPath = join(
      __dirname,
      "migrations",
      "005_payment_and_revenue_split.sql",
    );
    console.log(`Running migration: 005_payment_and_revenue_split.sql`);
    const sql = readFileSync(migrationPath, "utf-8");
    await query(sql);
    console.log(`✓ 005_payment_and_revenue_split.sql completed successfully`);
  } catch (error) {
    console.error(`✗ Error:`, error);
  } finally {
    await pool.end();
  }
}

runPaymentMigration();
