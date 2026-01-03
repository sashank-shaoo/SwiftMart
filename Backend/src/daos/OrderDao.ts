import { query } from "../db/db";
import { Order } from "../models/Order";

export class OrderDao {
  /**
   * Create a new order
   */
  static async createOrder(order: Order): Promise<Order> {
    const text = `
      INSERT INTO orders (
        user_id, total_amount, shipping_fee, tax_amount, 
        payment_status, order_status, shipping_address, 
        billing_address, payment_method, transaction_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      order.user_id,
      order.total_amount,
      order.shipping_fee || 0,
      order.tax_amount || 0,
      order.payment_status || "pending",
      order.order_status || "processing",
      JSON.stringify(order.shipping_address),
      order.billing_address ? JSON.stringify(order.billing_address) : null,
      order.payment_method || null,
      order.transaction_id || null,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  /**
   * Get all orders for a specific user
   */
  static async getOrdersByUserId(userId: string): Promise<Order[]> {
    const text =
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC";
    const res = await query(text, [userId]);
    return res.rows;
  }

  /**
   * Get a single order by ID
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    const text = "SELECT * FROM orders WHERE id = $1";
    const res = await query(text, [orderId]);
    return res.rows[0] || null;
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<void> {
    const text =
      "UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2";
    await query(text, [status, orderId]);
  }
}
