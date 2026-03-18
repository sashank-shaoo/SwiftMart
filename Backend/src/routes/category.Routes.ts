import { Router } from "express";
import { CategoryController } from "../controllers/categoryController";
import { authMiddleware, requireAdmin } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/errorHandler";

const router = Router();

/**
 * @route GET /api/categories
 * @desc Get all categories
 * @access Public
 */
router.get("/", asyncHandler(CategoryController.getAllCategories));

/**
 * @route GET /api/categories/:id
 * @desc Get category by ID
 * @access Public
 */
router.get("/:id", asyncHandler(CategoryController.getCategoryById));

/**
 * @route POST /api/categories
 * @desc Create new category
 * @access Admin only
 */
router.post(
  "/",
  authMiddleware,
  requireAdmin,
  asyncHandler(CategoryController.createCategory),
);

/**
 * @route PATCH /api/categories/:id
 * @desc Update category
 * @access Admin only
 */
router.patch(
  "/:id",
  authMiddleware,
  requireAdmin,
  asyncHandler(CategoryController.updateCategory),
);

/**
 * @route DELETE /api/categories/:id
 * @desc Delete category
 * @access Admin only
 */
router.delete(
  "/:id",
  authMiddleware,
  requireAdmin,
  asyncHandler(CategoryController.deleteCategory),
);

export default router;
