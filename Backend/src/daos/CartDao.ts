import { query } from "../db/db";
import { Cart } from "../models/Cart";

export class CartDao {
  static async addToCart(cart: Cart): Promise<Cart> {
    const text = `
      INSERT INTO carts (user_id, item_id, seller_id, quantity, price_at_time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      cart.user_id,
      cart.item_id,
      cart.seller_id,
      cart.quantity,
      cart.price_at_time,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  static async findCartByUserId(userId: string): Promise<Cart[]> {
    const text = "SELECT * FROM carts WHERE user_id = $1";
    const res = await query(text, [userId]);
    return res.rows;
  }

  static async updateCartQuantity(
    id: string,
    quantity: number
  ): Promise<Cart | null> {
    const text =
      "UPDATE carts SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *";
    const res = await query(text, [quantity, id]);
    return res.rows[0] || null;
  }

  static async removeFromCart(id: string): Promise<void> {
    const text = "DELETE FROM carts WHERE id = $1";
    await query(text, [id]);
  }
}
