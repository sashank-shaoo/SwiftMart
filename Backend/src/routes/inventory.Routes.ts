import { Router } from "express";
import {
  getInventory,
  updateWarehouseLocation,
  restockProduct,
  setStockQuantity,
  updateLowStockThreshold,
  getLowStockProducts,
  checkStockAvailability,
} from "../controllers/inventoryController";
import {
  authMiddleware,
  requireSeller,
  requireSellerOrAdmin,
} from "../middlewares/authMiddleware";

const router = Router();

// ========== PUBLIC ROUTES (No authentication required) ==========

// Get inventory for a specific product (public - anyone can view)
router.get("/:product_id", getInventory);

// Check stock availability (public - for customers checking before purchase)
router.get("/:product_id/check", checkStockAvailability);

// ========== SELLER OR ADMIN ROUTES ==========

// Get all low stock products (sellers and admins need to monitor inventory)
router.get(
  "/low-stock/all",
  authMiddleware,
  requireSellerOrAdmin,
  getLowStockProducts
);

// ========== SELLER-ONLY ROUTES ==========

// Update warehouse location (only seller manages their warehouse)
router.patch(
  "/:product_id/warehouse",
  authMiddleware,
  requireSeller,
  updateWarehouseLocation
);

// Restock (add stock) - only seller can add inventory
router.post(
  "/:product_id/restock",
  authMiddleware,
  requireSeller,
  restockProduct
);

// Set absolute stock quantity - only seller can set exact stock levels
router.put(
  "/:product_id/stock",
  authMiddleware,
  requireSeller,
  setStockQuantity
);

// Update low stock threshold - only seller decides alert thresholds
router.patch(
  "/:product_id/threshold",
  authMiddleware,
  requireSeller,
  updateLowStockThreshold
);

export default router;
