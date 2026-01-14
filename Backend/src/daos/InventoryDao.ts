import { query } from "../db/db";
import { Inventory } from "../models/Inventory";

export class InventoryDao {
  static async getByProductId(productId: string): Promise<Inventory | null> {
    const res = await query("SELECT * FROM inventory WHERE product_id = $1", [
      productId,
    ]);
    return res.rows[0] || null;
  }

  static async updateStock(productId: string, quantity: number): Promise<void> {
    const text = `
      INSERT INTO inventory (product_id, quantity_available)
      VALUES ($1, $2)
      ON CONFLICT (product_id)
      DO UPDATE SET quantity_available = inventory.quantity_available + $2, updated_at = CURRENT_TIMESTAMP
    `;
    await query(text, [productId, quantity]);
  }

  static async reserveStock(
    productId: string,
    quantity: number
  ): Promise<boolean> {
    const text = `
      UPDATE inventory
      SET quantity_available = quantity_available - $2,
          quantity_reserved = quantity_reserved + $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1 AND quantity_available >= $2
      RETURNING *
    `;
    const res = await query(text, [productId, quantity]);
    return res.rows.length > 0;
  }
}
