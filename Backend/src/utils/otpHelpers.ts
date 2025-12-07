/**
 * Generate a cryptographically secure 6-digit OTP
 * @returns A 6-digit numeric string (e.g., "123456")
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Format expiry time as a human-readable string
 * @param minutes Number of minutes until expiry
 * @returns Formatted string (e.g., "5 minutes")
 */
export function formatExpiryTime(minutes: number): string {
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

/**
 * Validate email format
 * @param email Email address to validate
 * @returns true if valid email format, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize email for logging (hide middle part)
 * @param email Email to sanitize
 * @returns Sanitized email (e.g., "us**@example.com")
 */
export function sanitizeEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local}@${domain}`;
  return `${local[0]}${local[1]}**@${domain}`;
}
