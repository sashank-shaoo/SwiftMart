import { apiFetch } from "@/lib/apiClient";
import { Transaction } from "@/types";

export const paymentService = {
  checkoutSession: async (orderId: string): Promise<{ url: string }> => {
    return apiFetch(`/payments/checkout/${orderId}`, { method: "POST" });
  },

  getSellerEarnings: async (): Promise<{
    total_earnings: number;
    balance: number;
    transactions: Transaction[];
  }> => {
    return apiFetch("/payments/seller-earnings");
  },

  getAdminRevenue: async (): Promise<{
    total_revenue: number;
    total_orders: number;
    recent_transactions: Transaction[];
  }> => {
    return apiFetch("/payments/admin-revenue");
  },
};
