import { z } from "zod";

// Restock product schema
export const RestockProductSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be positive")
    .max(100000, "Quantity cannot exceed 100,000"),
  warehouse_location: z.string().min(1).max(255).optional(),
});

// Set stock quantity schema
export const SetStockQuantitySchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be negative")
    .max(100000, "Quantity cannot exceed 100,000"),
});

// Update low stock threshold schema
export const UpdateLowStockThresholdSchema = z.object({
  low_stock_threshold: z
    .number()
    .int("Threshold must be an integer")
    .min(0, "Threshold cannot be negative")
    .max(10000, "Threshold cannot exceed 10,000"),
});

// Update warehouse location schema
export const UpdateWarehouseLocationSchema = z.object({
  warehouse_location: z
    .string()
    .min(1, "Warehouse location is required")
    .max(255, "Warehouse location is too long"),
});

export type RestockProductInput = z.infer<typeof RestockProductSchema>;
export type SetStockQuantityInput = z.infer<typeof SetStockQuantitySchema>;
export type UpdateLowStockThresholdInput = z.infer<
  typeof UpdateLowStockThresholdSchema
>;
export type UpdateWarehouseLocationInput = z.infer<
  typeof UpdateWarehouseLocationSchema
>;
