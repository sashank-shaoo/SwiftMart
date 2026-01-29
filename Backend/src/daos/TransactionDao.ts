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
}
