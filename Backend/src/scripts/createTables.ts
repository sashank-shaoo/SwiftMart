import { query } from "../db/db";

const createCartTable = async () => {
  const dropText = `DROP TABLE IF EXISTS carts;`;

  const createText = `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE carts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,

      quantity INT NOT NULL CHECK (quantity > 0),
      price_at_time NUMERIC(10,2) NOT NULL,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Prevent a user from adding the same item twice
    CREATE UNIQUE INDEX IF NOT EXISTS unique_user_item_cart
      ON carts (user_id, item_id);
  `;

  try {
    await query(dropText);
    console.log("Cart table dropped");

    await query(createText);
    console.log("Cart table created successfully");
  } catch (err) {
    console.error("Error creating Cart table:", err);
  }
};

createCartTable();
