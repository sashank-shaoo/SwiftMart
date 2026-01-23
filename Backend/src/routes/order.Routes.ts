import express from "express";
import { OrderController } from "../controllers/orderController";
import {
  authMiddleware,
  requireSeller,
  requireSellerOrAdmin,
} from "../middlewares/authMiddleware";

const router = express.Router();

// ===== USER ROUTES =====

// Checkout (create order from cart)
router.post("/checkout", authMiddleware, OrderController.checkout);

// Get user's orders
router.get("/my-orders", authMiddleware, OrderController.getMyOrders);

// Get order details
router.get("/:id", authMiddleware, OrderController.getOrderDetails);

// Cancel order (user can cancel own order)
router.post("/:id/cancel", authMiddleware, OrderController.cancelOrder);

// ===== SELLER ROUTES =====

// Get seller's orders (orders containing their products)
router.get(
  "/seller/orders",
  authMiddleware,
  requireSeller,
  OrderController.getSellerOrders,
);

// Update order status (seller updates their items)
router.patch(
  "/:id/status",
  authMiddleware,
  requireSellerOrAdmin,
  OrderController.updateOrderStatus,
);

export default router;
