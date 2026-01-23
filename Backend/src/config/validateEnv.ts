/**
 * Validate required environment variables on app startup
 * Throws error and exits if critical env vars are missing
 */

// Update these based on YOUR .env file
const requiredEnvVars = ["JWT_SECRET", "COOKIE_SECRET"];

const optionalEnvVars = [
  "JWT_REFRESH_SECRET",
  "FRONTEND_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "ELASTICSEARCH_URL",
  "ELASTICSEARCH_API_KEY",
  "ELASTICSEARCH_INDEX",
  "BREVO_API_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "MAPBOX_ACCESS_TOKEN",
];

export function validateEnv() {
  const missing: string[] = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    console.error("❌ CRITICAL: Missing required environment variables:");
    missing.forEach((env) => console.error(`   - ${env}`));
    console.error("\n💡 Please check your .env file");
    process.exit(1);
  }

  // Warn about optional env vars
  const missingOptional: string[] = [];
  optionalEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingOptional.push(envVar);
    }
  });

  if (missingOptional.length > 0) {
    console.warn("⚠️  Optional environment variables not set:");
    missingOptional.forEach((env) => console.warn(`   - ${env}`));
  }

  console.log("✅ Environment validation passed");
}
