import { query } from "../db/db";
import { Seller } from "../models/Seller";

export class SellerDao {
  static async createSeller(seller: Seller): Promise<Seller> {
    const text = `
      INSERT INTO sellers (name, image, number, location, email, password, role, is_seller_verified, is_admin_verified, is_verified_email, refresh_token_hash, refresh_token_expires_at)
      VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326), $5, $6, $7, $8, $9, $10, $11, $12)
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
      seller.refresh_token_hash || null,
      seller.refresh_token_expires_at || null,
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

  static async updateRefreshToken(
    sellerId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void> {
    const text = `
      UPDATE sellers 
      SET refresh_token_hash = $1, refresh_token_expires_at = $2
      WHERE id = $3
    `;
    await query(text, [tokenHash, expiresAt, sellerId]);
  }

  static async clearRefreshToken(sellerId: string): Promise<void> {
    const text = `
      UPDATE sellers 
      SET refresh_token_hash = NULL, refresh_token_expires_at = NULL
      WHERE id = $1
    `;
    await query(text, [sellerId]);
  }
}
