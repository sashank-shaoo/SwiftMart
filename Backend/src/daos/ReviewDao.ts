import { query } from "../db/db";
import { Review } from "../models/Review";

export class ReviewDao {
  static async createReview(review: Review): Promise<Review> {
    const text = `
      INSERT INTO reviews (item_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      review.item_id,
      review.user_id,
      review.rating,
      review.comment,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  static async findReviewsByItemId(itemId: string): Promise<Review[]> {
    const text = "SELECT * FROM reviews WHERE item_id = $1";
    const res = await query(text, [itemId]);
    return res.rows;
  }
}
