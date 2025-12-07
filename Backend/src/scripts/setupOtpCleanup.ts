import { query } from "../db/db";

/**
 * PostgreSQL function to automatically clean up OTP records
 *
 * Cleanup Rules:
 * 1. Used OTPs: Deleted immediately (is_used = TRUE)
 * 2. Expired OTPs: Deleted after 10-minute grace period (expired + 10 min)
 *
 * This function can be called:
 * - Manually: SELECT cleanup_email_otps();
 * - Via pg_cron: Every 15 minutes
 * - Via Node.js cron: setInterval
 */
export async function createOtpCleanupFunction() {
  try {
    console.log("📦 Creating OTP cleanup function...");

    // Drop existing function if it exists
    await query(`
      DROP FUNCTION IF EXISTS cleanup_email_otps();
    `);

    // Create the cleanup function
    await query(`
      CREATE OR REPLACE FUNCTION cleanup_email_otps()
      RETURNS TABLE(deleted_count INTEGER, reason TEXT) AS $$
      DECLARE
        used_count INTEGER;
        expired_count INTEGER;
      BEGIN
        -- Delete used OTPs (immediate deletion)
        DELETE FROM email_otps 
        WHERE is_used = TRUE;
        
        GET DIAGNOSTICS used_count = ROW_COUNT;

        -- Delete expired OTPs after 10-minute grace period
        DELETE FROM email_otps 
        WHERE expires_at < NOW() - INTERVAL '10 minutes';
        
        GET DIAGNOSTICS expired_count = ROW_COUNT;

        -- Return results
        RETURN QUERY 
        SELECT used_count, 'Used OTPs deleted'::TEXT
        UNION ALL
        SELECT expired_count, 'Expired OTPs deleted (10+ min grace)'::TEXT;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log("✅ OTP cleanup function created successfully");

    // Test the function
    const result = await query("SELECT * FROM cleanup_email_otps()");
    console.log("🧪 Test cleanup result:", result.rows);

    return true;
  } catch (error) {
    console.error("❌ Error creating OTP cleanup function:", error);
    throw error;
  }
}

/**
 * Optional: Setup pg_cron job for automatic cleanup
 *
 * Prerequisites:
 * 1. Install pg_cron extension: CREATE EXTENSION pg_cron;
 * 2. Add to postgresql.conf: shared_preload_libraries = 'pg_cron'
 * 3. Restart PostgreSQL
 *
 * Run this function ONLY if pg_cron is installed
 */
export async function setupAutomaticCleanup() {
  try {
    console.log("🔄 Setting up automatic OTP cleanup...");

    // Check if pg_cron is available
    const extensionCheck = await query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
      ) as has_pg_cron;
    `);

    const hasPgCron = extensionCheck.rows[0].has_pg_cron;

    if (!hasPgCron) {
      console.log("⚠️  pg_cron extension not found");
      console.log("💡 To enable automatic cleanup:");
      console.log("   1. Install pg_cron: CREATE EXTENSION pg_cron;");
      console.log(
        "   2. Add to postgresql.conf: shared_preload_libraries = 'pg_cron'"
      );
      console.log("   3. Restart PostgreSQL");
      console.log("   4. Run this function again");
      return false;
    }

    // Remove existing job if it exists
    await query(`
      SELECT cron.unschedule('cleanup-email-otps');
    `).catch(() => {
      // Ignore error if job doesn't exist
    });

    // Schedule cleanup every 15 minutes
    await query(`
      SELECT cron.schedule(
        'cleanup-email-otps',
        '*/15 * * * *',
        'SELECT cleanup_email_otps();'
      );
    `);

    console.log("✅ Automatic cleanup scheduled (every 15 minutes)");

    // Show scheduled jobs
    const jobs = await query(
      "SELECT * FROM cron.job WHERE jobname = 'cleanup-email-otps'"
    );
    console.log("📋 Scheduled job:", jobs.rows[0]);

    return true;
  } catch (error) {
    console.error("❌ Error setting up automatic cleanup:", error);
    throw error;
  }
}

/**
 * Manually trigger cleanup (for testing or manual runs)
 */
export async function manualCleanupOtps() {
  try {
    console.log("🧹 Running manual OTP cleanup...");

    const result = await query("SELECT * FROM cleanup_email_otps()");

    console.log("✅ Cleanup completed:");
    result.rows.forEach((row) => {
      console.log(`   ${row.reason}: ${row.deleted_count}`);
    });

    return result.rows;
  } catch (error) {
    console.error("❌ Manual cleanup failed:", error);
    throw error;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      console.log("🚀 Setting up OTP cleanup system...\n");

      // Step 1: Create cleanup function
      await createOtpCleanupFunction();

      console.log("\n");

      // Step 2: Try to setup automatic cleanup (optional)
      const autoSetup = await setupAutomaticCleanup();

      if (!autoSetup) {
        console.log("\n⚠️  Automatic cleanup not enabled");
        console.log("💡 You can still run manual cleanup:");
        console.log("   - From SQL: SELECT * FROM cleanup_email_otps();");
        console.log(
          "   - From Node: import { manualCleanupOtps } from './scripts/setupOtpCleanup';"
        );
      }

      process.exit(0);
    } catch (error) {
      console.error("❌ Setup failed:", error);
      process.exit(1);
    }
  })();
}
