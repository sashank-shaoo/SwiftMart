import { query } from "../db/db";
import { SellerProfile } from "../models/SellerProfile";

export class SellerProfileDao {
  static async createSellerProfile(
    userId: string,
    profileData: Partial<SellerProfile>,
  ): Promise<SellerProfile> {
    const text = `
      INSERT INTO seller_profiles (user_id, store_name, gst_number, verification_status, payout_details, commission_rate)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      userId,
      profileData.store_name || null,
      profileData.gst_number || null,
      profileData.verification_status || "pending",
      profileData.payout_details
        ? JSON.stringify(profileData.payout_details)
        : null,
      profileData.commission_rate || 10.0,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  static async findSellerProfileByUserId(
    userId: string,
  ): Promise<SellerProfile | null> {
    const text = "SELECT * FROM seller_profiles WHERE user_id = $1";
    const res = await query(text, [userId]);
    return res.rows[0] || null;
  }

  static async findSellerProfileById(
    id: string,
  ): Promise<SellerProfile | null> {
    const text = "SELECT * FROM seller_profiles WHERE id = $1";
    const res = await query(text, [id]);
    return res.rows[0] || null;
  }

  static async updateSellerProfile(
    userId: string,
    updates: Partial<SellerProfile>,
  ): Promise<SellerProfile | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.store_name !== undefined) {
      fields.push(`store_name = $${paramIndex++}`);
      values.push(updates.store_name);
    }
    if (updates.gst_number !== undefined) {
      fields.push(`gst_number = $${paramIndex++}`);
      values.push(updates.gst_number);
    }
    if (updates.verification_status !== undefined) {
      fields.push(`verification_status = $${paramIndex++}`);
      values.push(updates.verification_status);
    }
    if (updates.payout_details !== undefined) {
      fields.push(`payout_details = $${paramIndex++}`);
      values.push(JSON.stringify(updates.payout_details));
    }
    if (updates.commission_rate !== undefined) {
      fields.push(`commission_rate = $${paramIndex++}`);
      values.push(updates.commission_rate);
    }

    if (fields.length === 0) {
      return this.findSellerProfileByUserId(userId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const text = `
      UPDATE seller_profiles 
      SET ${fields.join(", ")}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const res = await query(text, values);
    return res.rows[0] || null;
  }

  static async deleteSellerProfile(userId: string): Promise<boolean> {
    const text = "DELETE FROM seller_profiles WHERE user_id = $1";
    const res = await query(text, [userId]);
    return (res.rowCount ?? 0) > 0;
  }

  static async getAllVerifiedSellers(): Promise<SellerProfile[]> {
    const text = `
      SELECT * FROM seller_profiles 
      WHERE verification_status = 'verified'
      ORDER BY created_at DESC
    `;
    const res = await query(text);
    return res.rows;
  }

  static async getAllPendingSellers(): Promise<SellerProfile[]> {
    const text = `
      SELECT * FROM seller_profiles 
      WHERE verification_status = 'pending'
      ORDER BY created_at ASC
    `;
    const res = await query(text);
    return res.rows;
  }

  static async updateVerificationStatus(
    userId: string,
    status: "pending" | "verified" | "rejected",
  ): Promise<SellerProfile | null> {
    const text = `
      UPDATE seller_profiles 
      SET verification_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING *
    `;
    const res = await query(text, [status, userId]);
    return res.rows[0] || null;
  }
}
