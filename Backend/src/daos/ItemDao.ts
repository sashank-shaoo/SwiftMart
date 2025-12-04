import { query } from "../db/db";
import { Item } from "../models/Item";

export class ItemDao {
  static async createItem(item: Item): Promise<Item> {
    const text = `
      INSERT INTO items (name, image, price, description, category, season, seller_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      item.name,
      item.image,
      item.price,
      item.description,
      item.category,
      item.season,
      item.seller_id,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  static async findItemById(id: string): Promise<Item | null> {
    const text = "SELECT * FROM items WHERE id = $1";
    const res = await query(text, [id]);
    return res.rows[0] || null;
  }

  static async findAllItems(): Promise<Item[]> {
    const text = "SELECT * FROM items";
    const res = await query(text);
    return res.rows;
  }

  static async findItemsBySellerId(sellerId: string): Promise<Item[]> {
    const text = "SELECT * FROM items WHERE seller_id = $1";
    const res = await query(text, [sellerId]);
    return res.rows;
  }
}
