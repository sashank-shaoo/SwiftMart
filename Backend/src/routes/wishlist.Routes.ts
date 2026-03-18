import { Router } from "express";
import { WishlistController } from "../controllers/wishlistController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/errorHandler";

const router = Router();

// All wishlist routes require authentication

/**
 * POST /api/wishlist
 * Add product to wishlist
 */
router.post(
  "/",
  authMiddleware,
  asyncHandler(WishlistController.addToWishlist),
);

/**
 * GET /api/wishlist
 * Get user's wishlist
 */
router.get(
  "/",
  authMiddleware,
  asyncHandler(WishlistController.getUserWishlist),
);

/**
 * GET /api/wishlist/check/:product_id
 * Check if product is in wishlist
 */
router.get(
  "/check/:product_id",
  authMiddleware,
  asyncHandler(WishlistController.checkProductInWishlist),
);

/**
 * DELETE /api/wishlist/:product_id
 * Remove product from wishlist
 */
router.delete(
  "/:product_id",
  authMiddleware,
  asyncHandler(WishlistController.removeFromWishlist),
);

export default router;
