import { apiFetch } from "@/lib/apiClient";
import {
  Wishlist,
  WishlistWithProduct,
  WishlistResponse,
  CheckWishlistResponse,
} from "@/types";

export const wishlistService = {
  /**
   * Add product to wishlist
   */
  addToWishlist: async (product_id: string): Promise<Wishlist | null> => {
    return apiFetch("/wishlist", {
      method: "POST",
      body: JSON.stringify({ product_id }),
    });
  },

  /**
   * Remove product from wishlist
   */
  removeFromWishlist: async (product_id: string): Promise<void> => {
    return apiFetch(`/wishlist/${product_id}`, {
      method: "DELETE",
    });
  },

  /**
   * Get user's wishlist with product details
   */
  getUserWishlist: async (): Promise<WishlistResponse> => {
    return apiFetch("/wishlist");
  },

  /**
   * Check if product is in wishlist
   */
  checkInWishlist: async (
    product_id: string,
  ): Promise<CheckWishlistResponse> => {
    return apiFetch(`/wishlist/check/${product_id}`);
  },
};
