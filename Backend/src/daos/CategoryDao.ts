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
    category: Partial<Category>
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
    const text = "DELETE FROM categories WHERE id = $1";
    const res = await query(text, [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
