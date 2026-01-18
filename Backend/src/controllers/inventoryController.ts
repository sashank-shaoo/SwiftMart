import { Request, Response } from "express";
import { InventoryDao } from "../daos/InventoryDao";

/**
 * Get inventory for a specific product
 */
export const getInventory = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;

    const inventory = await InventoryDao.getByProductId(product_id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found for this product",
      });
    }

    return res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get inventory",
    });
  }
};

/**
 * Update warehouse location for a product's inventory
 */
export const updateWarehouseLocation = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const { warehouse_location } = req.body;

    if (!warehouse_location) {
      return res.status(400).json({
        success: false,
        message: "Warehouse location is required",
      });
    }

    // Update inventory with new warehouse location
    const text = `
      UPDATE inventory
      SET warehouse_location = $2,
      updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1
      RETURNING *
    `;
    const { query } = await import("../db/db");
    const result = await query(text, [product_id, warehouse_location]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found for this product",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Warehouse location updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update warehouse location error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update warehouse location",
    });
  }
};

/**
 * Add stock (restock operation)
 */
export const restockProduct = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const { quantity } = req.body;

    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const inventory = await InventoryDao.addStock(product_id, quantity);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found for this product",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully added ${quantity} units to inventory`,
      data: inventory,
    });
  } catch (error) {
    console.error("Restock error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to restock product",
    });
  }
};

/**
 * Set absolute stock quantity
 */
export const setStockQuantity = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const { quantity } = req.body;

    if (
      quantity === undefined ||
      typeof quantity !== "number" ||
      quantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const inventory = await InventoryDao.setStock(product_id, quantity);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found for this product",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Stock quantity set to ${quantity} units`,
      data: inventory,
    });
  } catch (error) {
    console.error("Set stock error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set stock quantity",
    });
  }
};

/**
 * Update low stock threshold
 */
export const updateLowStockThreshold = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const { threshold } = req.body;

    if (
      threshold === undefined ||
      typeof threshold !== "number" ||
      threshold < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid threshold is required",
      });
    }

    const inventory = await InventoryDao.updateLowStockThreshold(
      product_id,
      threshold
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found for this product",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Low stock threshold updated to ${threshold}`,
      data: inventory,
    });
  } catch (error) {
    console.error("Update threshold error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update low stock threshold",
    });
  }
};

/**
 * Get all products with low stock
 */
export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const lowStockProducts = await InventoryDao.getLowStockProducts();

    return res.status(200).json({
      success: true,
      message: `Found ${lowStockProducts.length} products with low stock`,
      data: lowStockProducts,
    });
  } catch (error) {
    console.error("Get low stock products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get low stock products",
    });
  }
};

/**
 * Check stock availability for a product
 */
export const checkStockAvailability = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const { quantity } = req.query;

    if (!quantity || isNaN(Number(quantity))) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity parameter is required",
      });
    }

    const requestedQty = Number(quantity);
    const available = await InventoryDao.checkStockAvailability(
      product_id,
      requestedQty
    );

    const availableStock = await InventoryDao.getAvailableStock(product_id);

    return res.status(200).json({
      success: true,
      data: {
        available,
        requested_quantity: requestedQty,
        available_stock: availableStock,
      },
    });
  } catch (error) {
    console.error("Check stock availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check stock availability",
    });
  }
};
