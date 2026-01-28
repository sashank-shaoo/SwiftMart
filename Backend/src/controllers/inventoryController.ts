import { Request, Response } from "express";
import { InventoryDao } from "../daos/InventoryDao";
import { BadRequestError, NotFoundError } from "../utils/errors";

/**
 * GET /api/inventory/:product_id
 * Get inventory for a specific product
 */
export const getInventory = async (req: Request, res: Response) => {
  const { product_id } = req.params;

  const inventory = await InventoryDao.getByProductId(product_id);

  if (!inventory) {
    throw new NotFoundError("Inventory not found for this product");
  }

  return res.success(inventory, "Inventory fetched successfully");
};

/**
 * PATCH /api/inventory/:product_id/warehouse
 * Update warehouse location for a product's inventory
 */
export const updateWarehouseLocation = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const { warehouse_location } = req.body;

  if (!warehouse_location) {
    throw new BadRequestError("Warehouse location is required");
  }

  // Update inventory with new warehouse location
  const inventory = await InventoryDao.updateWarehouseLocation(
    product_id,
    warehouse_location,
  );

  if (!inventory) {
    throw new NotFoundError("Inventory not found for this product");
  }

  return res.success(inventory, "Warehouse location updated successfully");
};

/**
 * POST /api/inventory/:product_id/restock
 * Add stock (restock operation)
 */
export const restockProduct = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || typeof quantity !== "number" || quantity <= 0) {
    throw new BadRequestError("Valid quantity is required");
  }

  const inventory = await InventoryDao.addStock(product_id, quantity);

  if (!inventory) {
    throw new NotFoundError("Inventory not found for this product");
  }

  return res.success(
    inventory,
    `Successfully added ${quantity} units to inventory`,
  );
};

/**
 * PUT /api/inventory/:product_id/stock
 * Set absolute stock quantity
 */
export const setStockQuantity = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || typeof quantity !== "number" || quantity < 0) {
    throw new BadRequestError("Valid quantity is required");
  }

  const inventory = await InventoryDao.setStock(product_id, quantity);

  if (!inventory) {
    throw new NotFoundError("Inventory not found for this product");
  }

  return res.success(inventory, `Stock quantity set to ${quantity} units`);
};

/**
 * PATCH /api/inventory/:product_id/threshold
 * Update low stock threshold
 */
export const updateLowStockThreshold = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const { threshold } = req.body;

  if (
    threshold === undefined ||
    typeof threshold !== "number" ||
    threshold < 0
  ) {
    throw new BadRequestError("Valid threshold is required");
  }

  const inventory = await InventoryDao.updateLowStockThreshold(
    product_id,
    threshold,
  );

  if (!inventory) {
    throw new NotFoundError("Inventory not found for this product");
  }

  return res.success(inventory, `Low stock threshold updated to ${threshold}`);
};

/**
 * GET /api/inventory/low-stock/list
 * Get all products with low stock
 */
export const getLowStockProducts = async (req: Request, res: Response) => {
  const lowStockProducts = await InventoryDao.getLowStockProducts();

  return res.success(
    lowStockProducts,
    `Found ${lowStockProducts.length} products with low stock`,
  );
};

/**
 * GET /api/inventory/:product_id/check
 * Check stock availability for a product
 */
export const checkStockAvailability = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const { quantity } = req.query;

  if (!quantity || isNaN(Number(quantity))) {
    throw new BadRequestError("Valid quantity parameter is required");
  }

  // Check if inventory exists
  const inventory = await InventoryDao.getByProductId(product_id);
  if (!inventory) {
    throw new NotFoundError("Inventory not found for this product");
  }

  const requestedQty = Number(quantity);
  const available = await InventoryDao.checkStockAvailability(
    product_id,
    requestedQty,
  );

  const availableStock = await InventoryDao.getAvailableStock(product_id);

  return res.success(
    {
      available,
      requested_quantity: requestedQty,
      available_stock: availableStock,
    },
    "Stock availability checked",
  );
};
