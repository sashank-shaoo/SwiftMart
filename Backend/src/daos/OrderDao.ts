import { query } from "../db/db";
import { Order } from "../models/Order";

export class OrderDao {
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

  static async getOrdersByUserId(userId: string): Promise<Order[]> {
    const text =
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC";
    const res = await query(text, [userId]);
    return res.rows;
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    const text = "SELECT * FROM orders WHERE id = $1";
    const res = await query(text, [orderId]);
    return res.rows[0] || null;
  }

  static async updateOrderStatus(
    orderId: string,
    status: string,
  ): Promise<void> {
    const text =
      "UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2";
    await query(text, [status, orderId]);
  }

  static async getOrdersBySellerId(sellerId: string): Promise<Order[]> {
    const text = `
      SELECT DISTINCT o.*
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.seller_id = $1
      ORDER BY o.created_at DESC
    `;
    const res = await query(text, [sellerId]);
    return res.rows;
  }

  static async getOverallRevenueStats() {
    const text = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) FILTER (WHERE order_status = 'processing') as active_orders
      FROM orders
      WHERE payment_status = 'paid'
    `;
    const res = await query(text);
    return res.rows[0];
  }

  static async getRecentSystemActivity(limit: number = 10) {
    const text = `
      (SELECT 'order' as type, u.name, o.total_amount::text as value, o.created_at
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT $1)
      UNION ALL
      (SELECT 'user' as type, name, NULL as value, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1)
      ORDER BY created_at DESC
      LIMIT $1
    `;
    const res = await query(text, [limit]);
    return res.rows;
  }
}
