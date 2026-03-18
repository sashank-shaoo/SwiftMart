import { query } from "../db/db";
import { Category } from "../models/Category";

export class CategoryDao {
  static async createCategory(category: Category): Promise<Category> {
    const text = `
      INSERT INTO categories (name, slug, parent_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [category.name, category.slug, category.parent_id || null];
    const res = await query(text, values);
    return res.rows[0];
  }

  static async findCategoryById(id: string): Promise<Category | null> {
    const text = "SELECT * FROM categories WHERE id = $1";
    const res = await query(text, [id]);
    return res.rows[0] || null;
  }

  static async findCategoryBySlug(slug: string): Promise<Category | null> {
    const text = "SELECT * FROM categories WHERE slug = $1";
    const res = await query(text, [slug]);
    return res.rows[0] || null;
  }

  static async findAllCategories(): Promise<Category[]> {
    const text = "SELECT * FROM categories ORDER BY name";
    const res = await query(text);
    return res.rows;
  }

  static async findChildCategories(parentId: string): Promise<Category[]> {
    const text = "SELECT * FROM categories WHERE parent_id = $1 ORDER BY name";
    const res = await query(text, [parentId]);
    return res.rows;
  }

  static async findRootCategories(): Promise<Category[]> {
    const text =
      "SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name";
    const res = await query(text);
    return res.rows;
  }

  static async updateCategory(
    id: string,
    category: Partial<Category>,
  ): Promise<Category | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (category.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(category.name);
    }
    if (category.slug !== undefined) {
      fields.push(`slug = $${paramIndex++}`);
      values.push(category.slug);
    }
    if (category.parent_id !== undefined) {
      fields.push(`parent_id = $${paramIndex++}`);
      values.push(category.parent_id);
    }

    if (fields.length === 0) {
      return this.findCategoryById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const text = `
      UPDATE categories 
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const res = await query(text, values);
    return res.rows[0] || null;
  }

  static async deleteCategory(id: string): Promise<boolean> {
    const text = "DELETE FROM categories WHERE id = $1 RETURNING *";
    const res = await query(text, [id]);
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Get all categories with product count
   * Used for displaying categories with their associated product counts
   */
  static async getAllCategoriesWithProductCount(): Promise<any[]> {
    const text = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    const res = await query(text);
    return res.rows;
  }

  /**
   * Count products in a specific category
   * Used for validation before category deletion
   */
  static async countProductsByCategory(categoryId: string): Promise<number> {
    const text =
      "SELECT COUNT(*) as count FROM products WHERE category_id = $1";
    const res = await query(text, [categoryId]);
    return parseInt(res.rows[0].count);
  }

  /**
   * Count subcategories of a specific category
   * Used for validation before category deletion
   */
  static async countSubcategories(categoryId: string): Promise<number> {
    const text =
      "SELECT COUNT(*) as count FROM categories WHERE parent_id = $1";
    const res = await query(text, [categoryId]);
    return parseInt(res.rows[0].count);
  }

  /**
   * Check if a slug already exists, optionally excluding a specific category ID
   * Used for validation during create and update operations
   */
  static async checkSlugConflict(
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    let text: string;
    let values: any[];

    if (excludeId) {
      text = "SELECT id FROM categories WHERE slug = $1 AND id != $2";
      values = [slug, excludeId];
    } else {
      text = "SELECT id FROM categories WHERE slug = $1";
      values = [slug];
    }

    const res = await query(text, values);
    return res.rows.length > 0;
  }
}
