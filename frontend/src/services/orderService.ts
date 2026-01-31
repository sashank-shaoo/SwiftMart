import { apiFetch } from "@/lib/apiClient";
import { Order, OrderItem } from "@/types";

export const orderService = {
  checkout: async (
    paymentMethod: string,
    shippingAddress?: any,
  ): Promise<Order> => {
    return apiFetch("/orders/checkout", {
      method: "POST",
      body: JSON.stringify({
        paymentMethod,
        shipping_address: shippingAddress,
      }),
    });
  },

  getMyOrders: async (): Promise<{ orders: Order[] }> => {
    return apiFetch("/orders/my-orders");
  },

  getOrderDetails: async (
    id: string,
  ): Promise<Order & { items: OrderItem[] }> => {
    return apiFetch(`/orders/${id}`);
  },

  cancelOrder: async (id: string): Promise<{ message: string }> => {
    return apiFetch(`/orders/${id}/cancel`, { method: "POST" });
  },

  getSellerOrders: async (): Promise<{ orders: Order[] }> => {
    return apiFetch("/orders/seller/orders");
  },

  updateOrderStatus: async (
    id: string,
    status: string,
  ): Promise<{ message: string }> => {
    return apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
