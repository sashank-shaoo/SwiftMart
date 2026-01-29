import express from "express";
import * as orderPaymentController from "../controllers/orderPaymentController";
import {
  authMiddleware,
  requireSeller,
  requireAdmin,
} from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/errorHandler";

const router = express.Router();

// Checkout route (Any authenticated user can checkout their order)
router.post(
  "/checkout/:orderId",
  authMiddleware,
  asyncHandler(orderPaymentController.checkout),
);

// Seller earnings route (Restricted to Sellers)
router.get(
  "/seller-earnings",
  authMiddleware,
  requireSeller,
  asyncHandler(orderPaymentController.getSellerEarnings),
);

// Admin revenue route (Restricted to Admins)
router.get(
  "/admin-revenue",
  authMiddleware,
  requireAdmin,
  asyncHandler(orderPaymentController.getPlatformRevenue),
);

export default router;
