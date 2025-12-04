import { query } from "../db/db";
import { Admin } from "../models/Admin";

export class AdminDao {
  static async createAdmin(admin: Admin): Promise<Admin> {
    const text = `
      INSERT INTO admins (name, email, password, number, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      admin.name,
      admin.email,
      admin.password,
      admin.number || null,
      admin.role || "admin",
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
}
