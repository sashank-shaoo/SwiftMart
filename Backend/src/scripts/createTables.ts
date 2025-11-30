import { query } from "../db/db";

const createReviewTable = async () => {
  const dropText = `DROP TABLE IF EXISTS reviews;`;

  const createText = `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,

      rating NUMERIC(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
      comment TEXT,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Prevent a user from reviewing the same item twice
    CREATE UNIQUE INDEX IF NOT EXISTS unique_user_item_review
      ON reviews (user_id, item_id);
  `;

  try {
    await query(dropText);
    console.log("Reviews table dropped");

    await query(createText);
    console.log("Reviews table created successfully");
  } catch (err) {
    console.error("Error creating Reviews table:", err);
  }
};

createReviewTable();
