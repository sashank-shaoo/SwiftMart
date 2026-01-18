import { query } from "../db/db";
import { OrderItem } from "../models/OrderItem";

export class OrderItemDao {
  static async createOrderItem(item: OrderItem): Promise<OrderItem> {
    const text = `
      INSERT INTO order_items (
        order_id, product_id, seller_id, quantity, price_at_purchase
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      item.order_id,
      item.product_id,
      item.seller_id,
      item.quantity,
      item.price_at_purchase,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  static async getItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    const text = `
      SELECT oi.*, p.name as product_name, p.images as product_images
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;
    const res = await query(text, [orderId]);
    return res.rows;
  }
}
