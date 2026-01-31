import { apiFetch } from "@/lib/apiClient";
import { CartItem } from "@/types";

export const cartService = {
  getCart: async (): Promise<CartItem[]> => {
    return apiFetch("/carts");
  },

  addToCart: async (productId: string, quantity: number): Promise<CartItem> => {
    return apiFetch("/carts", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  updateQuantity: async (itemId: string, quantity: number): Promise<void> => {
    return apiFetch(`/carts/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart: async (itemId: string): Promise<void> => {
    return apiFetch(`/carts/${itemId}`, { method: "DELETE" });
  },

  clearCart: async (): Promise<void> => {
    return apiFetch("/carts", { method: "DELETE" });
  },
};
