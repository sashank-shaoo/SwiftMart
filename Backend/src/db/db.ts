import { Pool } from "pg";

/**
 * PostgreSQL connection pool
 * Supports both local (individual params) and cloud (DATABASE_URL)
 */

let pool: Pool;

// Check if DATABASE_URL is provided (for Neon/cloud)
if (process.env.DATABASE_URL) {
  console.log("🌩️  Using DATABASE_URL (Neon/Cloud connection)");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Neon
    },
  });
} else {
  // Use individual parameters (for local PostgreSQL)
  console.log("💻 Using local PostgreSQL connection");
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
  });
}

// Test connection on startup
pool.on("connect", () => {
  console.log("✅ Database connected");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err);
  process.exit(-1);
});

/**
 * Execute a query
 * @param text SQL query string
 * @param params Query parameters
 */
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

/**
 * Get a client from the pool (for transactions)
 */
export const getClient = () => {
  return pool.connect();
};

export default pool;
