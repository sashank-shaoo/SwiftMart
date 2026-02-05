import { Request, Response } from "express";
import { UserDao } from "../daos/UserDao";
import { SellerProfileDao } from "../daos/SellerProfileDao";
import { OrderDao } from "../daos/OrderDao";
import { NotificationDao } from "../daos/NotificationDao";
import { InternalServerError, NotFoundError } from "../utils/errors";

/**
 * Controller for system-wide administrative actions
 */
export class AdminController {
  /**
   * GET /api/admin/overview
   * Aggregates key metrics and recent system activity
   */
  static async getDashboardOverview(req: Request, res: Response) {
    try {
      const [userStats, sellerStats, revenueStats, topSellers, activity] =
        await Promise.all([
          UserDao.getUserStats(),
          SellerProfileDao.getSellerStats(),
          OrderDao.getOverallRevenueStats(),
          SellerProfileDao.getTopSellersByRevenue(5),
          OrderDao.getRecentSystemActivity(10),
        ]);

      // Ensure consistent data structure and numeric types
      const formattedStats = {
        total_users: Number(userStats?.total_users || 0),
        unverified_users: Number(userStats?.unverified_users || 0),
        total_sellers: Number(sellerStats?.total_sellers || 0),
        pending_sellers: Number(sellerStats?.pending_sellers || 0),
        total_revenue: parseFloat(String(revenueStats?.total_revenue || 0)),
        active_orders: Number(revenueStats?.active_orders || 0),
      };

      const formattedTopSellers = topSellers.map((s: any) => ({
        ...s,
        total_sales: parseFloat(String(s.total_sales || 0)),
        total_orders: Number(s.total_orders || 0),
      }));

      return res.success(
        {
          stats: formattedStats,
          topSellers: formattedTopSellers,
          recentActivity: activity,
        },
        "System overview retrieved successfully",
      );
    } catch (error) {
      console.error("Admin Dashboard Overview Error:", error);
      throw new InternalServerError("Failed to gather system metrics");
    }
  }

  /**
   * GET /api/admin/alerts
   * Fetches unread system notifications
   */
  static async getAdminAlerts(req: Request, res: Response) {
    try {
      const alerts = await NotificationDao.getUnreadNotifications();
      console.log(`🔍 [ADMIN] Fetched ${alerts.length} unread alerts`);
      return res.success(alerts, "Pending admin alerts retrieved");
    } catch (error) {
      console.error("Admin Alerts Error:", error);
      throw new InternalServerError("Failed to fetch system alerts");
    }
  }

  /**
   * PATCH /api/admin/alerts/:id/read
   * Mark a system notification as handled
   */
  static async markAlertAsRead(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await NotificationDao.markAsRead(id);
      return res.success(null, "System alert cleared");
    } catch (error) {
      console.error(`Error marking alert ${id} as read:`, error);
      throw new InternalServerError(
        "An unexpected error occurred while clearing the alert",
      );
    }
  }

  /**
   * PATCH /api/admin/sellers/:userId/approve
   * Approves a pending seller application
   */
  static async approveSeller(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const profile = await SellerProfileDao.updateVerificationStatus(
        userId,
        "verified",
      );

      if (!profile) {
        throw new NotFoundError("Seller profile not found");
      }

      // Logic for notifying the user could go here (Email/In-app)
      console.log(`✅ [ADMIN] Seller approved: ${userId}`);

      return res.success(profile, "Seller application approved successfully");
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      console.error(`Error approving seller ${userId}:`, error);
      throw new InternalServerError("Failed to approve seller application");
    }
  }
}
