import { apiFetch } from "@/lib/apiClient";
import { Order, OrderItem, CheckoutResponse } from "@/types";

export const orderService = {
  /**
   * @deprecated Use checkout() instead - this is the old single-order flow
   */
  createOrder: async (orderData: {
    items: { product_id: string; quantity: number; price_at_time: number }[];
    shipping_address: any;
    payment_method: string;
    total_amount: number;
  }): Promise<Order> => {
    return apiFetch("/orders/checkout", {
      method: "POST",
      body: JSON.stringify({
        paymentMethod: orderData.payment_method,
        shipping_address: orderData.shipping_address,
      }),
    });
  },

  /**
   * Unified checkout - creates multiple orders (one per seller) and processes payment
   */
  checkout: async (
    paymentMethod: string,
    shippingAddress?: any,
  ): Promise<CheckoutResponse> => {
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

  getSellerEarnings: async (): Promise<{
    total_earnings: number;
    total_sales: number;
    platform_commission: number;
  }> => {
    return apiFetch("/orders/seller/earnings");
  },

  /**
   * Update order status (seller only)
   * When status is 'shipped', returns delivery tracking info
   */
  updateOrderStatus: async (
    id: string,
    status: string,
  ): Promise<{
    status: string;
    shippedAt?: string;
    distanceKm?: number;
    estimatedDeliveryTime?: string;
    deliveryMinutes?: number;
  }> => {
    return apiFetch(`/orders/${id}/status`, {
      method: "PUT", // Changed from PATCH
      body: JSON.stringify({ status }),
    });
  },
};
