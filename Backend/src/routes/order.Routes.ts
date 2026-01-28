import express from "express";
import * as OrderController from "../controllers/orderController";
import {
  authMiddleware,
  requireSeller,
  requireSellerOrAdmin,
} from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/errorHandler";

const router = express.Router();

// ===== USER ROUTES =====

// Checkout (create order from cart)
router.post(
  "/checkout",
  authMiddleware,
  asyncHandler(OrderController.checkout),
);

// Get user's orders
router.get(
  "/my-orders",
  authMiddleware,
  asyncHandler(OrderController.getMyOrders),
);

// Get order details
router.get(
  "/:id",
  authMiddleware,
  asyncHandler(OrderController.getOrderDetails),
);

// Cancel order (user can cancel own order)
router.post(
  "/:id/cancel",
  authMiddleware,
  asyncHandler(OrderController.cancelOrder),
);

// ===== SELLER ROUTES =====

// Get seller's orders (orders containing their products)
router.get(
  "/seller/orders",
  authMiddleware,
  requireSeller,
  asyncHandler(OrderController.getSellerOrders),
);

// Update order status (seller updates their items)
router.patch(
  "/:id/status",
  authMiddleware,
  requireSellerOrAdmin,
  asyncHandler(OrderController.updateOrderStatus),
);

export default router;
