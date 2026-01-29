import { Request, Response } from "express";
import PaymentService from "../services/PaymentService";
import { TransactionDao } from "../daos/TransactionDao";
import { SellerProfileDao } from "../daos/SellerProfileDao";
import { AdminProfileDao } from "../daos/AdminProfileDao";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors";

/**
 * Handle simulated checkout for an order
 * POST /api/payments/checkout/:orderId
 */
export const checkout = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { paymentMethod = "Simulated Card" } = req.body;
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const result = await PaymentService.processSimulatedPayment(
    orderId,
    paymentMethod,
  );

  if (!result.success) {
    throw new BadRequestError(result.error || "Payment failed");
  }

  return res.success(
    {
      transactionId: result.transactionId,
    },
    "Payment processed and revenue split successfully",
  );
};

/**
 * Get seller earnings and transaction history
 * GET /api/seller/earnings
 */
export const getSellerEarnings = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const profile = await SellerProfileDao.findSellerProfileByUserId(userId);
  if (!profile) {
    throw new NotFoundError("Seller profile not found");
  }

  const transactions = await TransactionDao.getTransactionsBySellerId(userId);

  return res.success(
    {
      totalEarnings: parseFloat((profile.total_earnings as any) || "0"),
      currentBalance: parseFloat((profile.current_balance as any) || "0"),
      transactions,
    },
    "Seller earnings fetched successfully",
  );
};

/**
 * Get platform-wide revenue (Admin Only)
 * GET /api/admin/revenue
 */
export const getPlatformRevenue = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  const profile = await AdminProfileDao.findAdminProfileByUserId(userId);

  const totalRevenue = await TransactionDao.getTotalPlatformRevenue();

  return res.success(
    {
      totalPlatformRevenue: totalRevenue,
      adminProfile: profile,
    },
    "Platform revenue fetched successfully",
  );
};
