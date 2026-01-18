import { query } from "../db/db";
import { Notification } from "../models/Notification";

export class NotificationDao {
  static async createNotification(
    notification: Notification
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
    const res = await query(text, values);
    return res.rows[0];
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
