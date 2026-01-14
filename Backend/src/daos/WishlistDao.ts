import { query } from "../db/db";
import { Wishlist } from "../models/Wishlist";

export class WishlistDao {
  static async addToWishlist(userId: string, productId: string): Promise<void> {
    const text = `
      INSERT INTO wishlists (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
    `;
    await query(text, [userId, productId]);
  }

  static async removeFromWishlist(
    userId: string,
    productId: string
  ): Promise<void> {
    await query(
      "DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );
  }

  static async getByUserId(userId: string): Promise<any[]> {
    const text = `
      SELECT w.*, p.name, p.price, p.images
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `;
    const res = await query(text, [userId]);
    return res.rows;
  }
}
