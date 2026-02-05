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

  approveSeller: async (userId: string): Promise<any> => {
    return apiFetch(`/admin/sellers/${userId}/approve`, {
      method: "PATCH",
    });
  },
};
