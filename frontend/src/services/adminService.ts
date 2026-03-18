import { apiFetch } from "@/lib/apiClient";
import { AdminOverview, AdminAlert } from "@/types";

export const adminService = {
  getOverview: async (): Promise<AdminOverview> => {
    return apiFetch("/admin/overview");
  },

  getAlerts: async (): Promise<AdminAlert[]> => {
    return apiFetch("/admin/alerts");
  },

  markAlertRead: async (id: string): Promise<void> => {
    return apiFetch(`/admin/alerts/${id}/read`, {
      method: "PATCH",
    });
  },

  getPendingSellers: async (): Promise<{
    pendingSellers: any[];
    count: number;
  }> => {
    return apiFetch("/admin/pending-sellers");
  },

  approveSeller: async (userId: string): Promise<any> => {
    return apiFetch(`/admin/sellers/${userId}/approve`, {
      method: "PATCH",
    });
  },

  getProductSales: async (
    params: {
      limit?: number;
      sortBy?: "revenue" | "units";
      page?: number;
    } = {},
  ): Promise<any> => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch(`/admin/products/sales?${query}`);
  },
};
