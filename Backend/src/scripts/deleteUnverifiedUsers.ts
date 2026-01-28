import "dotenv/config";
import { query } from "../db/db";

/**
 * Script to delete unverified users and sellers from the database.
 *
 * Target:
 * 1. Users where is_verified_email = false
 * 2. Sellers where is_verified_email = false
 *
 * Usage:
 * npx ts-node src/scripts/deleteUnverifiedUsers.ts
 */
export async function deleteUnverifiedUsers() {
  try {
    console.log("🧹 Starting cleanup of unverified accounts...");

    // 1. Delete unverified users
    const deleteUsersRes = await query(`
      DELETE FROM users 
      WHERE is_verified_email = false
      RETURNING email;
    `);

    const deletedUsersCount = deleteUsersRes.rowCount ?? 0;
    if (deletedUsersCount > 0) {
      console.log(`✅ Deleted ${deletedUsersCount} unverified users:`);
      deleteUsersRes.rows.forEach((row) => console.log(`   - ${row.email}`));
    } else {
      console.log("ℹ️ No unverified users found.");
    }

    console.log("\n✨ Cleanup completed successfully.");
    return { deletedUsersCount };
  } catch (error) {
    console.error("❌ Error during unverified user deletion:", error);
    throw error;
  }
}

// Run script if executed directly
if (require.main === module) {
  (async () => {
    try {
      await deleteUnverifiedUsers();
      process.exit(0);
    } catch (error) {
      process.exit(1);
    }
  })();
}
