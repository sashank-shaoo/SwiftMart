# OTP Auto-Cleanup Setup Guide

## Overview

Automatically clean up email OTPs from the database with two deletion strategies:

1. **Used OTPs**: Deleted immediately after verification
2. **Expired OTPs**: Deleted 10 minutes after expiration (grace period)

---

## Quick Start

### Option 1: Run TypeScript Setup Script (Recommended)

```bash
cd d:\D-DRIVE\ecommerce\Backend
npx ts-node src/scripts/setupOtpCleanup.ts
```

This will:

- ✅ Create the `cleanup_email_otps()` PostgreSQL function
- ✅ Attempt to schedule automatic cleanup (if pg_cron is available)
- ✅ Show you the next steps if pg_cron is not installed

### Option 2: Run SQL Migration Manually

```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Run the migration file
\i d:/D-DRIVE/ecommerce/Backend/src/scripts/migrations/otp_auto_cleanup.sql
```

---

## Automatic Cleanup Options

### 🔧 Option A: Using pg_cron (Database-level scheduling)

**Pros**: No Node.js overhead, runs even if server is down
**Cons**: Requires PostgreSQL extension and restart

**Steps**:

1. Install pg_cron extension:

   ```sql
   CREATE EXTENSION pg_cron;
   ```

2. Edit `postgresql.conf`:

   ```conf
   shared_preload_libraries = 'pg_cron'
   ```

3. Restart PostgreSQL service

4. Schedule the job:

   ```sql
   SELECT cron.schedule(
     'cleanup-email-otps',
     '*/15 * * * *',
     'SELECT cleanup_email_otps();'
   );
   ```

5. Verify it's scheduled:
   ```sql
   SELECT * FROM cron.job;
   ```

---

### 💻 Option B: Using Node.js setInterval (Application-level scheduling)

**Pros**: No PostgreSQL extensions needed, easier to set up
**Cons**: Only runs when server is running

**Add to your `Server.ts`**:

```typescript
import { manualCleanupOtps } from "./scripts/setupOtpCleanup";

// Start cleanup job (every 15 minutes)
setInterval(async () => {
  try {
    const result = await manualCleanupOtps();
    console.log("🧹 OTP Cleanup completed:", result);
  } catch (error) {
    console.error("❌ OTP Cleanup failed:", error);
  }
}, 15 * 60 * 1000); // 15 minutes

console.log("✅ OTP auto-cleanup job started (every 15 minutes)");
```

---

## Manual Testing

### Test the cleanup function:

```sql
-- Run cleanup manually
SELECT * FROM cleanup_email_otps();

-- Expected output:
-- deleted_count |           reason
-- --------------|----------------------------
--            5  | Used OTPs deleted
--            3  | Expired OTPs deleted (10+ min grace)
```

### Check OTP records before/after cleanup:

```sql
-- View all OTPs
SELECT email, purpose, is_used, expires_at,
       expires_at < NOW() as is_expired,
       expires_at < NOW() - INTERVAL '10 minutes' as should_delete
FROM email_otps;
```

---

## Verification

### Check if cleanup function exists:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'cleanup_email_otps';
```

### Check if pg_cron job is scheduled:

```sql
SELECT * FROM cron.job WHERE jobname = 'cleanup-email-otps';
```

### Monitor cleanup job execution:

```sql
-- View recent cron job runs (if using pg_cron)
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-email-otps')
ORDER BY start_time DESC
LIMIT 10;
```

---

## Troubleshooting

### pg_cron not found?

```
ERROR: extension "pg_cron" is not available
```

**Solution**: Use Option B (Node.js setInterval) instead

### Function doesn't delete anything?

**Possible causes**:

- No OTPs are actually expired (check with `SELECT * FROM email_otps`)
- Grace period hasn't passed (OTPs deleted 10 min AFTER expiry)

### How to unschedule the job?

```sql
SELECT cron.unschedule('cleanup-email-otps');
```

---

## Recommended Setup

**For Production**: Use pg_cron (Option A)
**For Development**: Use Node.js setInterval (Option B)

---

## What Gets Deleted?

| Condition                     | Grace Period   | Example                                        |
| ----------------------------- | -------------- | ---------------------------------------------- |
| `is_used = TRUE`              | **Immediate**  | OTP verified at 10:00 AM → deleted at 10:00 AM |
| `expires_at < NOW() - 10 min` | **10 minutes** | OTP expired at 10:00 AM → deleted at 10:10 AM  |

## Why 10-Minute Grace Period?

- ✅ Debugging: Recent OTPs still visible in database for debugging
- ✅ Logging: Gives time to capture logs if email delivery was slow
- ✅ Clock skew: Handles minor time differences between servers
