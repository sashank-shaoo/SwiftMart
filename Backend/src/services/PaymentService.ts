import { getClient } from "../db/db";
import { OrderDao } from "../daos/OrderDao";
import { OrderItemDao } from "../daos/OrderItemDao";
import { SellerProfileDao } from "../daos/SellerProfileDao";
import { AdminProfileDao } from "../daos/AdminProfileDao";
import logger from "../config/logger";

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

class PaymentService {
  /**
   * Process a simulated payment for an order
   * This includes calculating the split and updating balances atomicly
   */
  async processSimulatedPayment(
    orderId: string,
    paymentMethod: string,
  ): Promise<PaymentResult> {
    const client = await getClient();

    try {
      await client.query("BEGIN");

      // 1. Get Order
      const orderRes = await client.query(
        "SELECT * FROM orders WHERE id = $1",
        [orderId],
      );
      const order = orderRes.rows[0];

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.payment_status === "paid") {
        throw new Error("Order already paid");
      }

      // 2. Get Order Items with Seller Info
      const itemsRes = await client.query(
        `
        SELECT oi.*, sp.commission_rate 
        FROM order_items oi
        JOIN seller_profiles sp ON oi.seller_id = sp.user_id
        WHERE oi.order_id = $1
      `,
        [orderId],
      );
      const items = itemsRes.rows;

      if (items.length === 0) {
        throw new Error("No items found for this order");
      }

      const transactionId = `SIM_TX_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // 3. Process each seller's split
      const sellerSplits = new Map<
        string,
        {
          total: number;
          seller_amount: number;
          platform_amount: number;
          commission_rate: number;
        }
      >();

      for (const item of items) {
        const itemTotal = parseFloat(item.price_at_purchase) * item.quantity;
        const commissionRate = parseFloat(item.commission_rate || "10.0");
        const platformAmount = itemTotal * (commissionRate / 100);
        const sellerAmount = itemTotal - platformAmount;

        const current = sellerSplits.get(item.seller_id) || {
          total: 0,
          seller_amount: 0,
          platform_amount: 0,
          commission_rate: commissionRate,
        };

        sellerSplits.set(item.seller_id, {
          total: current.total + itemTotal,
          seller_amount: current.seller_amount + sellerAmount,
          platform_amount: current.platform_amount + platformAmount,
          commission_rate: commissionRate,
        });
      }

      // 4. Update Database for each seller
      let totalPlatformRevenue = 0;

      for (const [sellerId, split] of sellerSplits.entries()) {
        totalPlatformRevenue += split.platform_amount;

        // Create transaction record
        await client.query(
          `
          INSERT INTO transactions (order_id, seller_id, total_amount, seller_amount, platform_amount, commission_rate, status)
          VALUES ($1, $2, $3, $4, $5, $6, 'completed')
        `,
          [
            orderId,
            sellerId,
            split.total,
            split.seller_amount,
            split.platform_amount,
            split.commission_rate,
          ],
        );

        // Update seller balance
        await client.query(
          `
          UPDATE seller_profiles 
          SET total_earnings = total_earnings + $1, 
              current_balance = current_balance + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $2
        `,
          [split.seller_amount, sellerId],
        );
      }

      // 5. Update Admin Revenue (pick the first admin)
      const adminRes = await client.query(
        "SELECT user_id FROM admin_profiles LIMIT 1",
      );
      if (adminRes.rows.length > 0) {
        const adminId = adminRes.rows[0].user_id;
        await client.query(
          `
          UPDATE admin_profiles 
          SET total_revenue = total_revenue + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $2
        `,
          [totalPlatformRevenue, adminId],
        );
      } else {
        logger.warn("No admin profile found to credit platform revenue");
      }

      // 6. Update Order Status
      await client.query(
        `
        UPDATE orders 
        SET payment_status = 'paid', 
            payment_method = $1, 
            transaction_id = $2, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $3
      `,
        [paymentMethod, transactionId, orderId],
      );

      await client.query("COMMIT");

      return {
        success: true,
        transactionId,
      };
    } catch (error: any) {
      await client.query("ROLLBACK");
      logger.error(
        `Payment processing failed for order ${orderId}: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    } finally {
      client.release();
    }
  }
}

export default new PaymentService();
