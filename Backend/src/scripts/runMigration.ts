import "dotenv/config";
import { query } from "../db/db";
import fs from "fs";
import path from "path";

async function runMigration() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error(
      "❌ Please provide the name of the migration file (e.g., 010_update_email_otps_table.sql)",
    );
    process.exit(1);
  }

  const filePath = path.join(__dirname, "migrations", migrationFile);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found at: ${filePath}`);
    process.exit(1);
  }

  try {
    const sql = fs.readFileSync(filePath, "utf8");
    console.log(`Running migration: ${migrationFile}...`);

    await query(sql);

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:");
    console.error(err);
    process.exit(1);
  }
}

runMigration();
