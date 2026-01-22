import { query } from "../db/db";
import { AdminProfile } from "../models/AdminProfile";

export class AdminProfileDao {
  static async createAdminProfile(
    userId: string,
    profileData?: Partial<AdminProfile>,
  ): Promise<AdminProfile> {
    const text = `
      INSERT INTO admin_profiles (user_id, permissions, department)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [
      userId,
      profileData?.permissions ? JSON.stringify(profileData.permissions) : "{}",
      profileData?.department || null,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  static async findAdminProfileByUserId(
    userId: string,
  ): Promise<AdminProfile | null> {
    const text = "SELECT * FROM admin_profiles WHERE user_id = $1";
    const res = await query(text, [userId]);
    return res.rows[0] || null;
  }

  static async findAdminProfileById(id: string): Promise<AdminProfile | null> {
    const text = "SELECT * FROM admin_profiles WHERE id = $1";
    const res = await query(text, [id]);
    return res.rows[0] || null;
  }

  static async updateAdminProfile(
    userId: string,
    updates: Partial<AdminProfile>,
  ): Promise<AdminProfile | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.permissions !== undefined) {
      fields.push(`permissions = $${paramIndex++}`);
      values.push(JSON.stringify(updates.permissions));
    }
    if (updates.department !== undefined) {
      fields.push(`department = $${paramIndex++}`);
      values.push(updates.department);
    }

    if (fields.length === 0) {
      return this.findAdminProfileByUserId(userId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const text = `
      UPDATE admin_profiles 
      SET ${fields.join(", ")}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const res = await query(text, values);
    return res.rows[0] || null;
  }

  static async deleteAdminProfile(userId: string): Promise<boolean> {
    const text = "DELETE FROM admin_profiles WHERE user_id = $1";
    const res = await query(text, [userId]);
    return (res.rowCount ?? 0) > 0;
  }

  static async getAllAdmins(): Promise<AdminProfile[]> {
    const text = "SELECT * FROM admin_profiles ORDER BY created_at DESC";
    const res = await query(text);
    return res.rows;
  }

  static async updatePermissions(
    userId: string,
    permissions: Record<string, boolean>,
  ): Promise<AdminProfile | null> {
    const text = `
      UPDATE admin_profiles 
      SET permissions = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING *
    `;
    const res = await query(text, [JSON.stringify(permissions), userId]);
    return res.rows[0] || null;
  }
}
