import express from "express";
import { authMiddleware, requireSeller } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import {
  createProductSchema,
  updateProductSchema,
} from "../validation(ZOD)/ProductValidation";
import { uploadProductImages } from "../middlewares/uploadMiddleware";
import { asyncHandler } from "../middlewares/errorHandler";
import {
  createProductWithImages,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  searchProducts,
  getSellerProducts,
} from "../controllers/productsController";
import {
  getProductsBySeason,
  getProductsByCategory,
  getBestSellers,
  getTopRated,
  getNewArrivals,
} from "../controllers/productFilterController";

const router = express.Router();

// ===== PUBLIC ROUTES (no auth required) =====

// Get all products with pagination & filters
router.get("/", asyncHandler(getAllProducts));

// Search products (Elasticsearch) - MUST be before /:product_id
router.get("/search", asyncHandler(searchProducts));

// ===== PRODUCT DISCOVERY ROUTES (new filters) =====
router.get("/bestsellers", asyncHandler(getBestSellers));
router.get("/top-rated", asyncHandler(getTopRated));
router.get("/new-arrivals", asyncHandler(getNewArrivals));
router.get("/season/:season", asyncHandler(getProductsBySeason));
router.get("/category/:category_id", asyncHandler(getProductsByCategory));

// Get seller's products - MUST be before /:product_id
router.get("/seller/:seller_id", asyncHandler(getSellerProducts));

// Get single product details (MUST be last among GET routes)
router.get("/:product_id", asyncHandler(getProductById));

// ===== SELLER ROUTES (auth required) =====

// Create product with images
router.post(
  "/",
  authMiddleware,
  requireSeller,
  uploadProductImages,
  validate(createProductSchema),
  asyncHandler(createProductWithImages),
);

// Update product
router.put(
  "/:product_id",
  authMiddleware,
  requireSeller,
  uploadProductImages,
  validate(updateProductSchema),
  asyncHandler(updateProduct),
);

// Delete product
router.delete(
  "/:product_id",
  authMiddleware,
  requireSeller,
  asyncHandler(deleteProduct),
);

export default router;
