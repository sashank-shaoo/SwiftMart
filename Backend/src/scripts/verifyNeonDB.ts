import "dotenv/config";
import { query } from "../db/db";

async function verifyNeonDatabase() {
  console.log("🔍 Verifying Neon Database Schema\n");

  try {
    // Get all tables
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("📊 Tables Created:\n");
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    console.log(`\n✅ Total: ${tablesResult.rows.length} tables\n`);

    // Check specific tables
    const expectedTables = [
      "users",
      "seller_profiles",
      "admin_profiles",
      "categories",
      "products",
      "inventory",
      "carts",
      "reviews",
      "orders",
      "order_items",
      "wishlists",
      "admin_notifications",
      "email_otps",
    ];

    console.log("✅ Checking Expected Tables:\n");
    for (const table of expectedTables) {
      const exists = tablesResult.rows.some((r) => r.table_name === table);
      console.log(`   ${exists ? "✅" : "❌"} ${table}`);
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }

  process.exit(0);
}

verifyNeonDatabase();
