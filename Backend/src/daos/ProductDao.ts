import { query } from "../db/db";
import { Product } from "../models/Product";

export class ProductDao {
  static async createProduct(product: Product): Promise<Product> {
    const text = `
      INSERT INTO products (
        name, description, sku, category_id, price, original_price, 
        images, attributes, seller_id, season, rating, review_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      product.name,
      product.description || null,
      product.sku || null,
      product.category_id,
      product.price,
      product.original_price || null,
      JSON.stringify(product.images), // Convert array to JSONB
      product.attributes ? JSON.stringify(product.attributes) : null,
      product.seller_id,
      product.season || null,
      product.rating || null,
      product.review_count || 0,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  static async findProductById(id: string): Promise<Product | null> {
    const text = "SELECT * FROM products WHERE id = $1";
    const res = await query(text, [id]);
    return res.rows[0] || null;
  }

  static async findProductBySku(sku: string): Promise<Product | null> {
    const text = "SELECT * FROM products WHERE sku = $1";
    const res = await query(text, [sku]);
    return res.rows[0] || null;
  }

  static async findAllProducts(): Promise<Product[]> {
    const text = "SELECT * FROM products ORDER BY created_at DESC";
    const res = await query(text);
    return res.rows;
  }

  static async findProductsBySellerId(sellerId: string): Promise<Product[]> {
    const text =
      "SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC";
    const res = await query(text, [sellerId]);
    return res.rows;
  }

  static async findProductsByCategory(categoryId: string): Promise<Product[]> {
    const text =
      "SELECT * FROM products WHERE category_id = $1 ORDER BY created_at DESC";
    const res = await query(text, [categoryId]);
    return res.rows;
  }

  static async findProductsBySeason(season: string): Promise<Product[]> {
    const text =
      "SELECT * FROM products WHERE season = $1 ORDER BY created_at DESC";
    const res = await query(text, [season]);
    return res.rows;
  }

  static async updateProduct(
    id: string,
    product: Partial<Product>
  ): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (product.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(product.name);
    }
    if (product.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(product.description);
    }
    if (product.sku !== undefined) {
      fields.push(`sku = $${paramIndex++}`);
      values.push(product.sku);
    }
    if (product.category_id !== undefined) {
      fields.push(`category_id = $${paramIndex++}`);
      values.push(product.category_id);
    }
    if (product.price !== undefined) {
      fields.push(`price = $${paramIndex++}`);
      values.push(product.price);
    }
    if (product.original_price !== undefined) {
      fields.push(`original_price = $${paramIndex++}`);
      values.push(product.original_price);
    }
    if (product.images !== undefined) {
      fields.push(`images = $${paramIndex++}`);
      values.push(JSON.stringify(product.images));
    }
    if (product.attributes !== undefined) {
      fields.push(`attributes = $${paramIndex++}`);
      values.push(JSON.stringify(product.attributes));
    }
    if (product.seller_id !== undefined) {
      fields.push(`seller_id = $${paramIndex++}`);
      values.push(product.seller_id);
    }
    if (product.season !== undefined) {
      fields.push(`season = $${paramIndex++}`);
      values.push(product.season);
    }
    if (product.rating !== undefined) {
      fields.push(`rating = $${paramIndex++}`);
      values.push(product.rating);
    }
    if (product.review_count !== undefined) {
      fields.push(`review_count = $${paramIndex++}`);
      values.push(product.review_count);
    }

    if (fields.length === 0) {
      return this.findProductById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const text = `
      UPDATE products 
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const res = await query(text, values);
    return res.rows[0] || null;
  }

  static async deleteProduct(id: string): Promise<boolean> {
    const text = "DELETE FROM products WHERE id = $1";
    const res = await query(text, [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
