import { query } from "../db/db";
import { Review } from "../models/Review";

export class ReviewDao {
  /**
   * Create a new review
   */
  static async createReview(review: Review): Promise<Review> {
    const text = `
      INSERT INTO reviews (product_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      review.product_id,
      review.user_id,
      review.rating,
      review.comment,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  /**
   * Find review by ID
   */
  static async findReviewById(id: string): Promise<Review | null> {
    const text = `
      SELECT r.*, u.first_name, u.last_name, u.email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `;
    const res = await query(text, [id]);
    return res.rows[0] || null;
  }

  /**
   * Find all reviews for a product
   */
  static async findReviewsByProductId(productId: string): Promise<Review[]> {
    const text = `
      SELECT r.*, u.name, u.email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `;
    const res = await query(text, [productId]);
    return res.rows;
  }

  /**
   * Find all reviews by a user
   */
  static async findReviewsByUserId(userId: string): Promise<Review[]> {
    const text = `
      SELECT r.*, p.name as product_name, p.images
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    const res = await query(text, [userId]);
    return res.rows;
  }

  /**
   * Update a review
   */
  static async updateReview(
    id: string,
    updates: Partial<Review>,
  ): Promise<Review | null> {
    const { rating, comment } = updates;

    const text = `
      UPDATE reviews
      SET 
        rating = COALESCE($1, rating),
        comment = COALESCE($2, comment),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const values = [rating, comment, id];
    const res = await query(text, values);
    return res.rows[0] || null;
  }

  /**
   * Delete a review
   */
  static async deleteReview(id: string): Promise<Review | null> {
    const text = "DELETE FROM reviews WHERE id = $1 RETURNING *";
    const res = await query(text, [id]);
    return res.rows[0] || null;
  }

  /**
   * Check if user has already reviewed a product
   */
  static async hasUserReviewedProduct(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const text = `
      SELECT EXISTS(
        SELECT 1 FROM reviews 
        WHERE user_id = $1 AND product_id = $2
      ) as exists
    `;
    const res = await query(text, [userId, productId]);
    return res.rows[0].exists;
  }

  /**
   * Check if user is the seller of the product
   * Prevents sellers from reviewing their own products
   */
  static async isUserProductSeller(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const text = `
      SELECT EXISTS(
        SELECT 1 FROM products 
        WHERE id = $1 AND seller_id = $2
      ) as exists
    `;
    const res = await query(text, [productId, userId]);
    return res.rows[0].exists;
  }

  /**
   * Update product rating and review count
   * Call this after creating, updating, or deleting a review
   */
  static async updateProductRatingStats(productId: string): Promise<void> {
    const text = `
      UPDATE products
      SET 
        rating = (
          SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
          FROM reviews
          WHERE product_id = $1
        ),
        review_count = (
          SELECT COUNT(*)
          FROM reviews
          WHERE product_id = $1
        )
      WHERE id = $1
    `;
    await query(text, [productId]);
  }
}
