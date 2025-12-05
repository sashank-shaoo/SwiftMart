import { query } from "../db/db";
import { Seller } from "../models/Seller";

export class SellerDao {
  static async createSeller(seller: Seller): Promise<Seller> {
    const text = `
      INSERT INTO sellers (name, image, number, location, email, password, role, is_seller_verified, is_admin_verified, is_verified_email)
      VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326), $5, $6, $7, $8, $9, $10)
      RETURNING *, ST_AsGeoJSON(location)::json as location
    `;
    const values = [
      seller.name,
      seller.image || null,
      seller.number || null,
      seller.location ? JSON.stringify(seller.location) : null,
      seller.email,
      seller.password,
      seller.role || "seller",
      seller.is_seller_verified || false,
      seller.is_admin_verified || false,
      seller.is_verified_email || false,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  static async findSellerByEmail(email: string): Promise<Seller | null> {
    const text =
      "SELECT *, ST_AsGeoJSON(location)::json as location FROM sellers WHERE email = $1";
    const res = await query(text, [email]);
    return res.rows[0] || null;
  }
}
