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

//Public route to get inventory for a specific product
router.get("/:product_id", getInventory);

//Public route to check stock availability
router.get("/:product_id/check", checkStockAvailability);

//Seller or Admin can get low stock products
router.get(
  "/low-stock/all",
  authMiddleware,
  requireSellerOrAdmin,
  getLowStockProducts
);

//Seller can update warehouse location
router.patch(
  "/:product_id/warehouse",
  authMiddleware,
  requireSeller,
  updateWarehouseLocation
);

//Seller can restock product
router.post(
  "/:product_id/restock",
  authMiddleware,
  requireSeller,
  restockProduct
);

//Seller can set stock quantity
router.put(
  "/:product_id/stock",
  authMiddleware,
  requireSeller,
  setStockQuantity
);

//Seller can update low stock threshold
router.patch(
  "/:product_id/threshold",
  authMiddleware,
  requireSeller,
  updateLowStockThreshold
);

export default router;
