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
import { validate } from "../middlewares/validateMiddleware";
import {
  RestockProductSchema,
  SetStockQuantitySchema,
  UpdateLowStockThresholdSchema,
  UpdateWarehouseLocationSchema,
} from "../validation(ZOD)/InventoryValidation";

const router = Router();

router.get("/:product_id", getInventory);

router.get("/:product_id/check", checkStockAvailability);

router.get(
  "/low-stock/all",
  authMiddleware,
  requireSellerOrAdmin,
  getLowStockProducts,
);

router.patch(
  "/:product_id/warehouse",
  authMiddleware,
  requireSeller,
  validate(UpdateWarehouseLocationSchema),
  updateWarehouseLocation,
);

router.post(
  "/:product_id/restock",
  authMiddleware,
  requireSeller,
  validate(RestockProductSchema),
  restockProduct,
);

router.put(
  "/:product_id/stock",
  authMiddleware,
  requireSeller,
  validate(SetStockQuantitySchema),
  setStockQuantity,
);

router.patch(
  "/:product_id/threshold",
  authMiddleware,
  requireSeller,
  validate(UpdateLowStockThresholdSchema),
  updateLowStockThreshold,
);

export default router;
