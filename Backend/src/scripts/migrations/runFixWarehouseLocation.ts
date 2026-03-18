import dotenv from "dotenv";
dotenv.config();
import { query } from "../../db/db";
import fs from "fs";
import path from "path";

async function runMigration() {
  console.log("🛠️ Running migration: Fix Warehouse Location Type...");

  try {
    const sqlPath = path.join(__dirname, "011_fix_warehouse_location_type.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Executing SQL...");
    await query(sql);

    console.log("✅ Migration completed successfully!");

    // faster verification
    const res = await query(`
      SELECT column_name, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'seller_profiles' AND column_name = 'warehouse_location'
    `);

    console.log("New column type:", res.rows[0]);
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();
