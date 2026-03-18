import { apiFetch } from "@/lib/apiClient";

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export const categoryService = {
  /**
   * Get all categories
   */
  getAll: async (): Promise<Category[]> => {
    return apiFetch("/categories");
  },

  /**
   * Get single category by ID
   */
  getById: async (id: string): Promise<Category> => {
    return apiFetch(`/categories/${id}`);
  },

  /**
   * Create new category (Admin only)
   */
  create: async (data: {
    name: string;
    slug: string;
    parent_id?: string;
  }): Promise<Category> => {
    return apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update category (Admin only)
   */
  update: async (
    id: string,
    data: { name?: string; slug?: string; parent_id?: string | null },
  ): Promise<Category> => {
    return apiFetch(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete category (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    return apiFetch(`/categories/${id}`, {
      method: "DELETE",
    });
  },
};
