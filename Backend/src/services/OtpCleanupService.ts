import { EmailOtpDao } from "../daos/EmailOtpDao";

/**
 * OTP Cleanup Service
 *
 * Automatically cleans up email OTPs from the database:
 * - Used OTPs: Deleted immediately after verification
 * - Expired OTPs: Deleted 10 minutes after expiration
 *
 * This service runs automatically when the server starts
 */

class OtpCleanupService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  /**
   * Start the cleanup job
   * @param intervalMinutes How often to run cleanup (default: 15 minutes)
   */
  start(intervalMinutes: number = 15) {
    if (this.isRunning) {
      console.log("⚠️  OTP cleanup service is already running");
      return;
    }

    console.log(
      `🧹 Starting OTP cleanup service (every ${intervalMinutes} minutes)`
    );

    // Run immediately on start
    this.runCleanup();

    // Schedule recurring cleanup
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, intervalMinutes * 60 * 1000);

    this.isRunning = true;
  }

  /**
   * Stop the cleanup job
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log("🛑 OTP cleanup service stopped");
    }
  }

  /**
   * Manually trigger cleanup
   */
  async runCleanup() {
    try {
      console.log("🧹 Running OTP cleanup...");

      const deletedCount = await EmailOtpDao.cleanupExpiredOtps();

      if (deletedCount > 0) {
        console.log(`✅ Cleaned up ${deletedCount} expired/used OTPs`);
      } else {
        console.log("✅ No OTPs to clean up");
      }

      return deletedCount;
    } catch (error) {
      console.error("❌ OTP cleanup failed:", error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId !== null,
    };
  }
}

// Export singleton instance
export const otpCleanupService = new OtpCleanupService();
