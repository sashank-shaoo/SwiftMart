import { query } from '../db/db';
import { User } from '../models/User';

export class UserDao {
  async createUser(user: User): Promise<User> {
    const text = `
      INSERT INTO users (name, age, number, location, email, password, bio, mobile_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      user.name,
      user.age,
      user.number,
      user.location,
      user.email,
      user.password,
      user.bio,
      user.mobile_number,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const text = 'SELECT * FROM users WHERE email = $1';
    const res = await query(text, [email]);
    return res.rows[0] || null;
  }
}
