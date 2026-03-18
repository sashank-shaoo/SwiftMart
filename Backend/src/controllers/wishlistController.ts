import { Request, Response } from "express";
import { WishlistDao } from "../daos/WishlistDao";
import { ProductDao } from "../daos/ProductDao";
import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} from "../utils/errors";

/**
 * Controller for wishlist management
 */
export class WishlistController {
  /**
   * POST /api/wishlist
   * Add product to user's wishlist
   */
  static async addToWishlist(req: Request, res: Response) {
    const user = req.user as any;
    const { product_id } = req.body;

    if (!product_id) {
      throw new BadRequestError("Product ID is required");
    }

    try {
      // Verify product exists
      const product = await ProductDao.findProductById(product_id);
      if (!product) {
        throw new NotFoundError("Product not found");
      }

      await WishlistDao.addToWishlist(user.id, product_id);

      console.log(`✅ [WISHLIST] User ${user.id} added product ${product_id}`);

      return res.success(
        { product_id, product_name: product.name },
        "Product added to wishlist",
        201,
      );
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      console.error("[WISHLIST] Error adding to wishlist:", error);
      throw new InternalServerError("Failed to add product to wishlist");
    }
  }

  /**
   * DELETE /api/wishlist/:product_id
   * Remove product from user's wishlist
   */
  static async removeFromWishlist(req: Request, res: Response) {
    const user = req.user as any;
    const { product_id } = req.params;

    try {
      await WishlistDao.removeFromWishlist(user.id, product_id);

      console.log(
        `✅ [WISHLIST] User ${user.id} removed product ${product_id}`,
      );

      return res.success(null, "Product removed from wishlist");
    } catch (error) {
      console.error("[WISHLIST] Error removing from wishlist:", error);
      throw new InternalServerError("Failed to remove product from wishlist");
    }
  }

  /**
   * GET /api/wishlist
   * Get user's wishlist with product details
   */
  static async getUserWishlist(req: Request, res: Response) {
    const user = req.user as any;

    try {
      const wishlist = await WishlistDao.getByUserId(user.id);

      return res.success(
        {
          wishlist,
          count: wishlist.length,
        },
        "Wishlist retrieved successfully",
      );
    } catch (error) {
      console.error("[WISHLIST] Error fetching wishlist:", error);
      throw new InternalServerError("Failed to fetch wishlist");
    }
  }

  /**
   * GET /api/wishlist/check/:product_id
   * Check if product is in user's wishlist
   */
  static async checkProductInWishlist(req: Request, res: Response) {
    const user = req.user as any;
    const { product_id } = req.params;

    try {
      const inWishlist = await WishlistDao.checkIfInWishlist(
        user.id,
        product_id,
      );

      return res.success(
        { inWishlist },
        inWishlist ? "Product is in wishlist" : "Product not in wishlist",
      );
    } catch (error) {
      console.error("[WISHLIST] Error checking wishlist:", error);
      throw new InternalServerError("Failed to check wishlist status");
    }
  }
}
