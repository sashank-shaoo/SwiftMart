import { query } from "../db/db";
import { Notification } from "../models/Notification";

export class NotificationDao {
  static async createNotification(
    notification: Notification,
  ): Promise<Notification> {
    const text = `
      INSERT INTO admin_notifications (type, message, metadata, is_read)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      notification.type,
      notification.message,
      notification.metadata ? JSON.stringify(notification.metadata) : null,
      notification.is_read || false,
    ];

    console.log("🔔 [DB] Creating admin notification:", {
      type: notification.type,
      message: notification.message,
    });

    try {
      const res = await query(text, values);
      console.log("✅ [DB] Notification created ID:", res.rows[0]?.id);
      return res.rows[0];
    } catch (err) {
      console.error("❌ [DB] Notification creation FAILED:", err);
      throw err;
    }
  }

  static async getUnreadNotifications(): Promise<Notification[]> {
    const text =
      "SELECT * FROM admin_notifications WHERE is_read = FALSE ORDER BY created_at DESC";
    const res = await query(text);
    return res.rows;
  }

  static async markAsRead(id: string): Promise<void> {
    const text =
      "UPDATE admin_notifications SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1";
    await query(text, [id]);
  }
}
