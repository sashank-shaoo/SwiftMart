import { query } from "../db/db";
import { Wishlist, WishlistWithProduct } from "../models/Wishlist";

export class WishlistDao {
  /**
   * Add product to user's wishlist
   * Returns the created wishlist item (or null if already exists due to conflict)
   */
  static async addToWishlist(
    userId: string,
    productId: string,
  ): Promise<Wishlist | null> {
    const text = `
      INSERT INTO wishlists (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `;
    const res = await query(text, [userId, productId]);
    return res.rows[0] || null;
  }

  /**
   * Remove product from user's wishlist
   * Returns true if removed, false if not found
   */
  static async removeFromWishlist(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const text = `
      DELETE FROM wishlists 
      WHERE user_id = $1 AND product_id = $2
      RETURNING *
    `;
    const res = await query(text, [userId, productId]);
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Get user's wishlist with product details
   * Returns wishlist items joined with product information
   */
  static async getByUserId(userId: string): Promise<WishlistWithProduct[]> {
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

  /**
   * Check if a product is in user's wishlist
   * Returns true if product is in wishlist, false otherwise
   */
  static async checkIfInWishlist(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const text = `
      SELECT EXISTS(
        SELECT 1 FROM wishlists 
        WHERE user_id = $1 AND product_id = $2
      ) as exists
    `;
    const res = await query(text, [userId, productId]);
    return res.rows[0].exists;
  }
}
