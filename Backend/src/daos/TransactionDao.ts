import { query } from "../db/db";
import { Transaction } from "../models/Transaction";

export class TransactionDao {
  static async createTransaction(
    transaction: Transaction,
  ): Promise<Transaction> {
    const text = `
      INSERT INTO transactions (
        order_id, seller_id, total_amount, 
        seller_amount, platform_amount, commission_rate, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      transaction.order_id,
      transaction.seller_id,
      transaction.total_amount,
      transaction.seller_amount,
      transaction.platform_amount,
      transaction.commission_rate,
      transaction.status || "completed",
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  static async getTransactionsByOrderId(
    orderId: string,
  ): Promise<Transaction[]> {
    const text = "SELECT * FROM transactions WHERE order_id = $1";
    const res = await query(text, [orderId]);
    return res.rows;
  }

  static async getTransactionsBySellerId(
    sellerId: string,
  ): Promise<Transaction[]> {
    const text =
      "SELECT * FROM transactions WHERE seller_id = $1 ORDER BY created_at DESC";
    const res = await query(text, [sellerId]);
    return res.rows;
  }

  static async getTotalPlatformRevenue(): Promise<number> {
    const text =
      "SELECT SUM(platform_amount) as total FROM transactions WHERE status = 'completed'";
    const res = await query(text);
    return parseFloat(res.rows[0].total || "0");
  }

  /**
   * Get seller's total earnings (after commission)
   * Returns the sum of seller_amount from all completed transactions
   */
  static async getSellerEarnings(sellerId: string): Promise<{
    total_earnings: number;
    total_sales: number;
    platform_commission: number;
  }> {
    const text = `
      SELECT 
        COALESCE(SUM(seller_amount), 0) as total_earnings,
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(SUM(platform_amount), 0) as platform_commission
      FROM transactions 
      WHERE seller_id = $1 AND status = 'completed'
    `;
    const res = await query(text, [sellerId]);
    return {
      total_earnings: parseFloat(res.rows[0].total_earnings || "0"),
      total_sales: parseFloat(res.rows[0].total_sales || "0"),
      platform_commission: parseFloat(res.rows[0].platform_commission || "0"),
    };
  }
}
