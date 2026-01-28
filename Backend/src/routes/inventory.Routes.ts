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
import { asyncHandler } from "../middlewares/errorHandler";
import {
  RestockProductSchema,
  SetStockQuantitySchema,
  UpdateLowStockThresholdSchema,
  UpdateWarehouseLocationSchema,
} from "../validation(ZOD)/InventoryValidation";

const router = Router();

router.get("/:product_id", asyncHandler(getInventory));

router.get("/:product_id/check", asyncHandler(checkStockAvailability));

router.get(
  "/low-stock/all",
  authMiddleware,
  requireSellerOrAdmin,
  asyncHandler(getLowStockProducts),
);

router.patch(
  "/:product_id/warehouse",
  authMiddleware,
  requireSeller,
  validate(UpdateWarehouseLocationSchema),
  asyncHandler(updateWarehouseLocation),
);

router.post(
  "/:product_id/restock",
  authMiddleware,
  requireSeller,
  validate(RestockProductSchema),
  asyncHandler(restockProduct),
);

router.put(
  "/:product_id/stock",
  authMiddleware,
  requireSeller,
  validate(SetStockQuantitySchema),
  asyncHandler(setStockQuantity),
);

router.patch(
  "/:product_id/threshold",
  authMiddleware,
  requireSeller,
  validate(UpdateLowStockThresholdSchema),
  asyncHandler(updateLowStockThreshold),
);

export default router;
