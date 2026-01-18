import express from "express";
import { authMiddleware, requireSeller } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import {
  createProductSchema,
  updateProductSchema,
} from "../validation(ZOD)/ProductValidation";
import { uploadProductImages } from "../middlewares/uploadMiddleware";
import {
  createProductWithImages,
  updateProduct,
} from "../controllers/productsController";

const router = express.Router();

/**
 * POST /api/products
 * Create a new product with image uploads (Seller only)
 *
 * Requires:
 * - Authentication (JWT token)
 * - Seller role
 * - Form-data with images and product details
 */
router.post(
  "/",
  authMiddleware, // Authenticate user
  requireSeller, // Ensure user is a seller
  uploadProductImages, // Handle file uploads (3-4 images)
  validate(createProductSchema), // Validate product data
  createProductWithImages // Create product
);

/**
 * PUT /api/products/:product_id
 * Update an existing product (Seller only - own products)
 *
 * Requires:
 * - Authentication (JWT token)
 * - Seller role
 * - Product ownership
 * - Optional: new images via form-data
 */
router.put(
  "/:product_id",
  authMiddleware, // Authenticate user
  requireSeller, // Ensure user is a seller
  uploadProductImages, // Handle optional file uploads (images)
  validate(updateProductSchema), // Validate update data
  updateProduct // Update product
);

export default router;
