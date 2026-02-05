import { query } from "./src/db/db";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, ".env") });

async function checkSchema() {
  console.log("🔍 Checking admin_notifications table schema...");
  try {
    const res = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'admin_notifications'
    `);

    if (res.rows.length === 0) {
      console.log("❌ Table 'admin_notifications' DOES NOT EXIST!");
    } else {
      console.log("✅ Table exists. Columns:");
      console.table(res.rows);
    }

    const countRes = await query("SELECT COUNT(*) FROM admin_notifications");
    console.log("📊 Current notification count:", countRes.rows[0].count);

    const unreadRes = await query(
      "SELECT COUNT(*) FROM admin_notifications WHERE is_read = FALSE",
    );
    console.log("🔴 Current unread notifications:", unreadRes.rows[0].count);
  } catch (err) {
    console.error("❌ Error checking schema:", err);
  } finally {
    process.exit();
  }
}

checkSchema();
