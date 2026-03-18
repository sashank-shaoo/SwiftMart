import { Request, Response } from "express";
import { CategoryDao } from "../daos/CategoryDao";
import RedisService from "../services/RedisService";
import {
  InternalServerError,
  NotFoundError,
  BadRequestError,
} from "../utils/errors";

/**
 * Controller for category management
 */
export class CategoryController {
  /**
   * GET /api/categories
   * Get all categories
   */
  static async getAllCategories(req: Request, res: Response) {
    try {
      // Try cache first (24 hour TTL for categories)
      const cacheKey = "categories:all";
      if (RedisService.isAvailable()) {
        const cached = await RedisService.get(cacheKey);
        if (cached) {
          // Return same structure as non-cached response
          return res.success(cached, "Categories retrieved from cache");
        }
      }

      const result = await CategoryDao.getAllCategoriesWithProductCount();

      // Cache for 24 hours (categories rarely change)
      if (RedisService.isAvailable()) {
        await RedisService.set(cacheKey, result, 86400);
      }

      return res.success(result, "Categories retrieved successfully");
    } catch (error) {
      console.error("[CATEGORY] Error fetching categories:", error);
      throw new InternalServerError("Failed to fetch categories");
    }
  }

  /**
   * GET /api/categories/:id
   * Get single category by ID
   */
  static async getCategoryById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const result = await CategoryDao.findCategoryById(id);

      if (!result) {
        throw new NotFoundError("Category not found");
      }

      return res.success(result, "Category retrieved successfully");
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      console.error(`[CATEGORY] Error fetching category ${id}:`, error);
      throw new InternalServerError("Failed to fetch category");
    }
  }

  /**
   * POST /api/categories
   * Create new category (Admin only)
   */
  static async createCategory(req: Request, res: Response) {
    const { name, slug, parent_id } = req.body;

    if (!name || !slug) {
      throw new BadRequestError("Name and slug are required");
    }

    try {
      // Check if slug already exists
      const slugExists = await CategoryDao.checkSlugConflict(slug);

      if (slugExists) {
        throw new BadRequestError("Category with this slug already exists");
      }

      const result = await CategoryDao.createCategory({
        name,
        slug,
        parent_id: parent_id || null,
      } as any);

      console.log(`✅ [CATEGORY] Created: ${name} (${slug})`);

      // Invalidate category cache
      if (RedisService.isAvailable()) {
        await RedisService.del("categories:all");
      }

      return res.success(result, "Category created successfully");
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      console.error("[CATEGORY] Error creating category:", error);
      throw new InternalServerError("Failed to create category");
    }
  }

  /**
   * PATCH /api/categories/:id
   * Update category (Admin only)
   */
  static async updateCategory(req: Request, res: Response) {
    const { id } = req.params;
    const { name, slug, parent_id } = req.body;

    try {
      // Check if category exists
      const existing = await CategoryDao.findCategoryById(id);

      if (!existing) {
        throw new NotFoundError("Category not found");
      }

      // Check if new slug conflicts with another category
      if (slug && slug !== existing.slug) {
        const slugExists = await CategoryDao.checkSlugConflict(slug, id);

        if (slugExists) {
          throw new BadRequestError("Category with this slug already exists");
        }
      }

      const result = await CategoryDao.updateCategory(id, {
        name,
        slug,
        parent_id: parent_id !== undefined ? parent_id : existing.parent_id,
      } as any);

      console.log(`✅ [CATEGORY] Updated: ${id}`);

      // Invalidate category cache
      if (RedisService.isAvailable()) {
        await RedisService.del("categories:all");
        await RedisService.del(`categories:detail:${id}`);
      }

      return res.success(result, "Category updated successfully");
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError)
        throw error;
      console.error(`[CATEGORY] Error updating category ${id}:`, error);
      throw new InternalServerError("Failed to update category");
    }
  }

  /**
   * DELETE /api/categories/:id
   * Delete category (Admin only)
   */
  static async deleteCategory(req: Request, res: Response) {
    const { id } = req.params;

    try {
      // Check if category has products
      const productCount = await CategoryDao.countProductsByCategory(id);

      if (productCount > 0) {
        throw new BadRequestError(
          "Cannot delete category with existing products. Please reassign products first.",
        );
      }

      // Check if category has subcategories
      const subCategoryCount = await CategoryDao.countSubcategories(id);

      if (subCategoryCount > 0) {
        throw new BadRequestError(
          "Cannot delete category with subcategories. Please delete subcategories first.",
        );
      }

      const deleted = await CategoryDao.deleteCategory(id);

      if (!deleted) {
        throw new NotFoundError("Category not found");
      }

      console.log(`✅ [CATEGORY] Deleted: ${id}`);

      // Invalidate category cache
      if (RedisService.isAvailable()) {
        await RedisService.del("categories:all");
        await RedisService.del(`categories:detail:${id}`);
      }

      return res.success(null, "Category deleted successfully");
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError)
        throw error;
      console.error(`[CATEGORY] Error deleting category ${id}:`, error);
      throw new InternalServerError("Failed to delete category");
    }
  }
}
