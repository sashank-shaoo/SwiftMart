-- ============================================
-- OTP Auto-Cleanup System
-- ============================================
-- Purpose: Automatically delete used and expired OTPs from email_otps table
-- 
-- Cleanup Rules:
-- 1. Used OTPs: Deleted immediately (is_used = TRUE)
-- 2. Expired OTPs: Deleted 10 minutes after expiry
-- 
-- Schedule: Every 15 minutes (if pg_cron is enabled)
-- ============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS cleanup_email_otps();

-- Create cleanup function
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

-- ============================================
-- Manual Testing
-- ============================================
-- To test the function manually, run:
-- SELECT * FROM cleanup_email_otps();
-- ============================================

-- ============================================
-- OPTION 1: Automatic Scheduling with pg_cron
-- ============================================
-- Prerequisites:
-- 1. Install extension: CREATE EXTENSION pg_cron;
-- 2. Add to postgresql.conf: shared_preload_libraries = 'pg_cron'
-- 3. Restart PostgreSQL
-- 
-- Uncomment below to enable automatic cleanup:
-- 
-- -- Remove existing job if it exists
-- SELECT cron.unschedule('cleanup-email-otps');
-- 
-- -- Schedule cleanup every 15 minutes
-- SELECT cron.schedule(
--   'cleanup-email-otps',
--   '*/15 * * * *',
--   'SELECT cleanup_email_otps();'
-- );
-- 
-- -- View scheduled jobs
-- SELECT * FROM cron.job WHERE jobname = 'cleanup-email-otps';
-- ============================================

-- ============================================
-- OPTION 2: Manual Trigger (No pg_cron needed)
-- ============================================
-- If you don't have pg_cron, you can:
-- 
-- 1. Call from SQL:
--    SELECT * FROM cleanup_email_otps();
-- 
-- 2. Call from Node.js (add to your server startup):
--    import { manualCleanupOtps } from './scripts/setupOtpCleanup';
--    setInterval(manualCleanupOtps, 15 * 60 * 1000); // Every 15 min
-- ============================================
