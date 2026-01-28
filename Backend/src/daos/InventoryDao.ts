import { query } from "../db/db";
import { Inventory } from "../models/Inventory";

export class InventoryDao {
  static async createInventory(
    productId: string,
    initialStock: number,
    lowStockThreshold: number = 5,
    warehouseLocation?: string,
  ): Promise<Inventory> {
    const text = `
      INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold, warehouse_location, last_restocked_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const res = await query(text, [
      productId,
      initialStock,
      lowStockThreshold,
      warehouseLocation || null,
    ]);
    return res.rows[0];
  }

  static async getByProductId(productId: string): Promise<Inventory | null> {
    const res = await query("SELECT * FROM inventory WHERE product_id = $1", [
      productId,
    ]);
    return res.rows[0] || null;
  }

  static async addStock(
    productId: string,
    quantity: number,
  ): Promise<Inventory | null> {
    const text = `
      UPDATE inventory
      SET stock_quantity = stock_quantity + $2,
          last_restocked_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1
      RETURNING *
    `;
    const res = await query(text, [productId, quantity]);
    return res.rows[0] || null;
  }

  static async setStock(
    productId: string,
    quantity: number,
  ): Promise<Inventory | null> {
    const text = `
      UPDATE inventory
      SET stock_quantity = $2,
          last_restocked_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1
      RETURNING *
    `;
    const res = await query(text, [productId, quantity]);
    return res.rows[0] || null;
  }

  static async reserveStock(
    productId: string,
    quantity: number,
  ): Promise<boolean> {
    const text = `
      UPDATE inventory
      SET reserved_quantity = reserved_quantity + $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1 AND (stock_quantity - reserved_quantity) >= $2
      RETURNING *
    `;
    const res = await query(text, [productId, quantity]);
    return res.rows.length > 0;
  }

  static async releaseReservedStock(
    productId: string,
    quantity: number,
  ): Promise<Inventory | null> {
    const text = `
      UPDATE inventory
      SET reserved_quantity = GREATEST(0, reserved_quantity - $2),
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1
      RETURNING *
    `;
    const res = await query(text, [productId, quantity]);
    return res.rows[0] || null;
  }

  static async confirmSale(
    productId: string,
    quantity: number,
  ): Promise<Inventory | null> {
    const text = `
      UPDATE inventory
      SET stock_quantity = stock_quantity - $2,
          reserved_quantity = GREATEST(0, reserved_quantity - $2),
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1 AND stock_quantity >= $2
      RETURNING *
    `;
    const res = await query(text, [productId, quantity]);
    return res.rows[0] || null;
  }

  static async getAvailableStock(productId: string): Promise<number> {
    const inventory = await this.getByProductId(productId);
    return inventory?.available_quantity ?? 0;
  }

  static async checkStockAvailability(
    productId: string,
    requestedQuantity: number,
  ): Promise<boolean> {
    const availableStock = await this.getAvailableStock(productId);
    return availableStock >= requestedQuantity;
  }

  static async getLowStockProducts(): Promise<Inventory[]> {
    const text = `
      SELECT * FROM inventory 
      WHERE available_quantity <= low_stock_threshold
      ORDER BY available_quantity ASC
    `;
    const res = await query(text);
    return res.rows;
  }

  static async updateLowStockThreshold(
    productId: string,
    threshold: number,
  ): Promise<Inventory | null> {
    const text = `
      UPDATE inventory
      SET low_stock_threshold = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1
      RETURNING *
    `;
    const res = await query(text, [productId, threshold]);
    return res.rows[0] || null;
  }

  static async updateWarehouseLocation(
    productId: string,
    warehouseLocation: string,
  ): Promise<Inventory | null> {
    const text = `
      UPDATE inventory
      SET warehouse_location = $2,
      updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1
      RETURNING *
    `;
    const res = await query(text, [productId, warehouseLocation]);
    return res.rows[0] || null;
  }

  static async deleteInventory(productId: string): Promise<boolean> {
    const text = "DELETE FROM inventory WHERE product_id = $1";
    const res = await query(text, [productId]);
    return (res.rowCount ?? 0) > 0;
  }
}
