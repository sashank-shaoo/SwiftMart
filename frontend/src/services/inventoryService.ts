import { apiFetch } from "@/lib/apiClient";
import { Inventory } from "@/types";

export const inventoryService = {
  getInventory: async (productId: string): Promise<Inventory> => {
    return apiFetch(`/inventory/${productId}`);
  },

  checkStock: async (
    productId: string,
  ): Promise<{ available: boolean; quantity: number }> => {
    return apiFetch(`/inventory/${productId}/check`);
  },

  getLowStockProducts: async (): Promise<Inventory[]> => {
    return apiFetch("/inventory/low-stock/all");
  },

  updateWarehouseLocation: async (
    productId: string,
    location: string,
  ): Promise<void> => {
    return apiFetch(`/inventory/${productId}/warehouse`, {
      method: "PATCH",
      body: JSON.stringify({ warehouse_location: location }),
    });
  },

  restockProduct: async (
    productId: string,
    quantity: number,
  ): Promise<void> => {
    return apiFetch(`/inventory/${productId}/restock`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    });
  },

  setStockQuantity: async (
    productId: string,
    quantity: number,
  ): Promise<void> => {
    return apiFetch(`/inventory/${productId}/stock`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  },

  updateLowStockThreshold: async (
    productId: string,
    threshold: number,
  ): Promise<void> => {
    return apiFetch(`/inventory/${productId}/threshold`, {
      method: "PATCH",
      body: JSON.stringify({ threshold }),
    });
  },
};
