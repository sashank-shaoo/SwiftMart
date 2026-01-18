import { z } from "zod";

// Base schema with common fields
const baseProductSchema = z.object({
  id: z.uuid().optional(),

  name: z
    .string()
    .trim()
    .min(4, "Product name must be at least 4 characters")
    .max(255, "Product name must be at most 255 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters")
    .optional(),

  sku: z
    .string()
    .trim()
    .min(3, "SKU must be at least 3 characters")
    .max(100, "SKU must be at most 100 characters")
    .regex(/^[A-Z0-9-]+$/, "SKU must be uppercase alphanumeric with hyphens")
    .optional(),

  category_id: z.uuid("Category ID must be a valid UUID"),

  price: z
    .number()
    .positive("Price must be positive")
    .max(10000000, "Price must not exceed 10,000,000"),

  original_price: z
    .number()
    .positive("Original price must be positive")
    .max(10000000, "Original price must not exceed 10,000,000")
    .optional(),

  attributes: z.record(z.string(), z.any()).optional(),

  seller_id: z.uuid("Seller ID must be a valid UUID"),

  season: z
    .enum(["summer", "winter", "spring", "autumn", "monsoon", "rainy"])
    .optional(),

  rating: z
    .number()
    .min(0, "Rating must be at least 0")
    .max(5, "Rating must not exceed 5")
    .refine((val) => Number((val * 100).toFixed(0)) === val * 100, {
      message: "Rating can have at most 2 decimal places",
    })
    .optional(),

  review_count: z
    .number()
    .int("Review count must be an integer")
    .nonnegative("Review count must be non-negative")
    .optional(),

  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// Full product schema with images (for general use)
export const productSchema = baseProductSchema.extend({
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
});

// Product creation schema without images (images handled by Multer)
export const createProductSchema = baseProductSchema
  .extend({
    initial_stock: z
      .number()
      .int("Initial stock must be an integer")
      .nonnegative("Initial stock must be non-negative")
      .optional(),

    low_stock_threshold: z
      .number()
      .int("Low stock threshold must be an integer")
      .positive("Low stock threshold must be positive")
      .optional(),
  })
  .omit({
    id: true,
    rating: true,
    review_count: true,
    created_at: true,
    updated_at: true,
  });

// Product update schema (all fields optional for partial updates)
export const updateProductSchema = createProductSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
