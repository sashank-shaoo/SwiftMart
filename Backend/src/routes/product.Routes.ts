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
router.get("/", getAllProducts);

// Search products (Elasticsearch) - MUST be before /:product_id
router.get("/search", searchProducts);

// ===== PRODUCT DISCOVERY ROUTES (new filters) =====
router.get("/bestsellers", getBestSellers);
router.get("/top-rated", getTopRated);
router.get("/new-arrivals", getNewArrivals);
router.get("/season/:season", getProductsBySeason);
router.get("/category/:category_id", getProductsByCategory);

// Get seller's products - MUST be before /:product_id
router.get("/seller/:seller_id", getSellerProducts);

// Get single product details (MUST be last among GET routes)
router.get("/:product_id", getProductById);

// ===== SELLER ROUTES (auth required) =====

// Create product with images
router.post(
  "/",
  authMiddleware,
  requireSeller,
  uploadProductImages,
  validate(createProductSchema),
  createProductWithImages,
);

// Update product
router.put(
  "/:product_id",
  authMiddleware,
  requireSeller,
  uploadProductImages,
  validate(updateProductSchema),
  updateProduct,
);

// Delete product
router.delete("/:product_id", authMiddleware, requireSeller, deleteProduct);

export default router;
