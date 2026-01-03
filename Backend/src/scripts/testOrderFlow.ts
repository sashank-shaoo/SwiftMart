import { OrderDao } from "../daos/OrderDao";
import { OrderItemDao } from "../daos/OrderItemDao";
import { CartDao } from "../daos/CartDao";
import { UserDao } from "../daos/UserDao";
import { ProductDao } from "../daos/ProductDao";
import { query, pool } from "../db/db";
import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(__dirname, "../../.env") });

async function testOrderFlow() {
  try {
    console.log("🚀 Starting Order Flow Test...");

    // 1. Get a test user and product
    const users = await query("SELECT id FROM users LIMIT 1");
    const products = await query(
      "SELECT id, seller_id, price FROM products LIMIT 1"
    );

    if (users.rows.length === 0 || products.rows.length === 0) {
      console.log(
        "⚠️ Need at least one user and one product in the database to run this test."
      );
      return;
    }

    const userId = users.rows[0].id;
    const product = products.rows[0];

    console.log(`👤 Using User: ${userId}`);
    console.log(`📦 Using Product: ${product.id} (Price: ${product.price})`);

    // 2. Clear cart and add an item
    console.log("🛒 Clearing cart and adding test item...");
    await CartDao.clearCartByUserId(userId);
    await CartDao.addToCart({
      user_id: userId,
      product_id: product.id,
      seller_id: product.seller_id,
      quantity: 2,
      price_at_time: product.price,
    });

    // 3. Manual Checkout Flow (Logic from Controller)
    console.log("💳 Running Checkout Flow...");

    // Calculate total
    const totalAmount = Number(product.price) * 2;

    // Create Order
    const newOrder = await OrderDao.createOrder({
      user_id: userId,
      total_amount: totalAmount,
      payment_status: "pending",
      order_status: "processing",
      shipping_address: { test: "User Saved Location" },
      billing_address: { city: "New Delhi" },
      payment_method: "cod",
    });

    // Create Item
    await OrderItemDao.createOrderItem({
      order_id: newOrder.id!,
      product_id: product.id,
      seller_id: product.seller_id,
      quantity: 2,
      price_at_purchase: Number(product.price),
    });

    // Clear Cart
    await CartDao.clearCartByUserId(userId);

    if (newOrder) {
      console.log("✅ Order Flow Logic Verified!");
      console.log("📄 Order Created:", JSON.stringify(newOrder, null, 2));
    }
  } catch (error) {
    console.error("❌ Test Failed:", error);
  } finally {
    await pool.end();
  }
}

testOrderFlow();
