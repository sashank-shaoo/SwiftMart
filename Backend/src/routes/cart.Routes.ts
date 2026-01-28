import express from "express";
import * as CartController from "../controllers/cartController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/errorHandler";

const router = express.Router();

// All cart routes require authentication

// Get user's cart
router.get("/", authMiddleware, asyncHandler(CartController.getCart));

// Add item to cart
router.post("/", authMiddleware, asyncHandler(CartController.addToCart));

// Update cart item quantity
router.patch(
  "/:id",
  authMiddleware,
  asyncHandler(CartController.updateQuantity),
);

// Remove item from cart
router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(CartController.removeFromCart),
);

// Clear entire cart
router.delete("/", authMiddleware, asyncHandler(CartController.clearCart));

export default router;
