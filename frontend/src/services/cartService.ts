import { apiFetch } from "@/lib/apiClient";
import { CartItem } from "@/types";

export const cartService = {
  getCart: async (): Promise<CartItem[]> => {
    const data = await apiFetch("/cart");
    return data.items || [];
  },

  addToCart: async (productId: string, quantity: number): Promise<CartItem> => {
    return apiFetch("/cart", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  updateQuantity: async (itemId: string, quantity: number): Promise<void> => {
    return apiFetch(`/cart/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart: async (itemId: string): Promise<void> => {
    return apiFetch(`/cart/${itemId}`, { method: "DELETE" });
  },

  clearCart: async (): Promise<void> => {
    return apiFetch("/cart", { method: "DELETE" });
  },
};
