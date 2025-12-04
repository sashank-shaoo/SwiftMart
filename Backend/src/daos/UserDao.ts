import { query } from "../db/db";
import { User } from "../models/User";

export class UserDao {
  static async createUser(user: User): Promise<User> {
    const text = `
      INSERT INTO users (name, age, number, location, email, password, bio, image, role)
      VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4::text), 4326), $5, $6, $7, $8, $9)
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
      user.role || "user",
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
}
