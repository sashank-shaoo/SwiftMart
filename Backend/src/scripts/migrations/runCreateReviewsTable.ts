import pool from "../../db/db";

async function createReviewsTable() {
  const client = await pool.connect();

  try {
    console.log("🔄 Creating reviews table...");

    await client.query(`
      -- Create reviews table
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL,
        user_id UUID NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Foreign keys
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

      -- Add comment
      COMMENT ON TABLE reviews IS 'Product reviews from users';
    `);

    console.log("✅ Reviews table created successfully!");
  } catch (error) {
    console.error("❌ Error creating reviews table:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createReviewsTable();
