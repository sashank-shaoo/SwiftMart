import { query } from "../db/db";
import { User } from "../models/User";

export class UserDao {
  static async createUser(user: User): Promise<User> {
    const text = `
      INSERT INTO users (name, age, number, location, email, password, bio, image, role, is_verified_email, refresh_token_hash, refresh_token_expires_at)
      VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4::text), 4326), $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *, ST_AsGeoJSON(location)::json as location
    `;
    const values = [
      user.name,
      user.age || null,
      user.number || null,
      user.location ? JSON.stringify(user.location) : null,
      user.email,
      user.password,
      user.bio || null,
      user.image || null,
      user.role,
      user.is_verified_email || false,
      user.refresh_token_hash || null,
      user.refresh_token_expires_at || null,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const text =
      "SELECT *, ST_AsGeoJSON(location)::json as location FROM users WHERE email = $1";
    const res = await query(text, [email]);
    return res.rows[0] || null;
  }

  static async findUserById(id: string): Promise<User | null> {
    const text =
      "SELECT *, ST_AsGeoJSON(location)::json as location FROM users WHERE id = $1";
    const res = await query(text, [id]);
    return res.rows[0] || null;
  }

  static async updateRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    const text = `
      UPDATE users 
      SET refresh_token_hash = $1, refresh_token_expires_at = $2
      WHERE id = $3
    `;
    await query(text, [tokenHash, expiresAt, userId]);
  }

  static async clearRefreshToken(userId: string): Promise<void> {
    const text = `
      UPDATE users 
      SET refresh_token_hash = NULL, refresh_token_expires_at = NULL
      WHERE id = $1
    `;
    await query(text, [userId]);
  }

  static async updateUserRole(
    userId: string,
    role: "user" | "seller" | "admin",
  ): Promise<User | null> {
    const text = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *, ST_AsGeoJSON(location)::json as location
    `;
    const res = await query(text, [role, userId]);
    return res.rows[0] || null;
  }

  static async findUsersByRole(
    role: "user" | "seller" | "admin",
  ): Promise<User[]> {
    const text = `
      SELECT *, ST_AsGeoJSON(location)::json as location 
      FROM users 
      WHERE role = $1
      ORDER BY created_at DESC
    `;
    const res = await query(text, [role]);
    return res.rows;
  }

  static async updateUser(
    userId: string,
    updates: Partial<User>,
  ): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.age !== undefined) {
      fields.push(`age = $${paramIndex++}`);
      values.push(updates.age);
    }
    if (updates.number !== undefined) {
      fields.push(`number = $${paramIndex++}`);
      values.push(updates.number);
    }
    if (updates.bio !== undefined) {
      fields.push(`bio = $${paramIndex++}`);
      values.push(updates.bio);
    }
    if (updates.image !== undefined) {
      fields.push(`image = $${paramIndex++}`);
      values.push(updates.image);
    }
    if (updates.location !== undefined) {
      fields.push(
        `location = ST_SetSRID(ST_GeomFromGeoJSON($${paramIndex++}::text), 4326)`,
      );
      values.push(JSON.stringify(updates.location));
    }
    if (updates.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }
    if (updates.password !== undefined) {
      fields.push(`password = $${paramIndex++}`);
      values.push(updates.password);
    }
    if (updates.is_verified_email !== undefined) {
      fields.push(`is_verified_email = $${paramIndex++}`);
      values.push(updates.is_verified_email);
    }

    if (fields.length === 0) {
      return this.findUserById(userId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const text = `
      UPDATE users 
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *, ST_AsGeoJSON(location)::json as location
    `;

    const res = await query(text, values);
    return res.rows[0] || null;
  }

  static async getUserStats() {
    const text = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE is_verified_email = FALSE) as unverified_users
      FROM users
      WHERE role = 'user'
    `;
    const res = await query(text);
    return res.rows[0];
  }
}
