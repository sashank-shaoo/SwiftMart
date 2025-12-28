import { z } from "zod";

export const productSchema = z.object({
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

  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),

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

export type ProductInput = z.infer<typeof productSchema>;
