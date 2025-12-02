import { query } from "../db/db";
import { User } from "../models/User";

export class UserDao {
  async createUser(user: User): Promise<User> {
    const text = `
      INSERT INTO users (name, age, number, location, email, password, bio, image, role)
      VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326), $5, $6, $7, $8, $9)
      RETURNING *, ST_AsGeoJSON(location)::json as location
    `;
    const values = [
      user.name,
      user.age,
      user.number,
      user.location ? JSON.stringify(user.location) : null,
      user.email,
      user.password,
      user.bio,
      user.image,
      user.role || "user",
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const text =
      "SELECT *, ST_AsGeoJSON(location)::json as location FROM users WHERE email = $1";
    const res = await query(text, [email]);
    return res.rows[0] || null;
  }
}
