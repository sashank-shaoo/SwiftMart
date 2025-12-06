import { query } from "../db/db";
import { Admin } from "../models/Admin";

export class AdminDao {
  static async createAdmin(admin: Admin): Promise<Admin> {
    const text = `
      INSERT INTO admins (name, email, password, number, role, refresh_token_hash, refresh_token_expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      admin.name,
      admin.email,
      admin.password,
      admin.number || null,
      admin.role || "admin",
      admin.refresh_token_hash || null,
      admin.refresh_token_expires_at || null,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  static async findAdminByEmail(email: string): Promise<Admin | null> {
    const text = "SELECT * FROM admins WHERE email = $1";
    const res = await query(text, [email]);
    return res.rows[0] || null;
  }

  static async findAdminById(id: string): Promise<Admin | null> {
    const text = "SELECT * FROM admins WHERE id = $1";
    const res = await query(text, [id]);
    return res.rows[0] || null;
  }

  static async updateRefreshToken(
    adminId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void> {
    const text = `
      UPDATE admins 
      SET refresh_token_hash = $1, refresh_token_expires_at = $2
      WHERE id = $3
    `;
    await query(text, [tokenHash, expiresAt, adminId]);
  }

  static async clearRefreshToken(adminId: string): Promise<void> {
    const text = `
      UPDATE admins 
      SET refresh_token_hash = NULL, refresh_token_expires_at = NULL
      WHERE id = $1
    `;
    await query(text, [adminId]);
  }
}
