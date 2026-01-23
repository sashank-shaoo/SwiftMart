import express from "express";
import { CartController } from "../controllers/cartController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// All cart routes require authentication

// Get user's cart
router.get("/", authMiddleware, CartController.getCart);

// Add item to cart
router.post("/", authMiddleware, CartController.addToCart);

// Update cart item quantity
router.patch("/:id", authMiddleware, CartController.updateQuantity);

// Remove item from cart
router.delete("/:id", authMiddleware, CartController.removeFromCart);

// Clear entire cart
router.delete("/", authMiddleware, CartController.clearCart);

export default router;
