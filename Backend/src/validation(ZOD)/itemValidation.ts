import { z } from "zod";

export const itemSchema = z.object({
  id: z.uuid().optional(),

  name: z
    .string()
    .trim()
    .min(4, "Name must be at least 4 characters")
    .max(30, "Name must be at most 30 characters"),

  image: z.url({ message: "Image must be a valid URL" }),

  price: z
    .number()
    .min(1, "Price must be at least 1")
    .max(1000000, "Price must not exceed 1,000,000"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description is too long")
    .optional(),

  category: z.string().optional(),

  season: z
    .enum(["summer", "winter", "spring", "autumn", "monsoon", "rainy"])
    .optional(),

  seller_id: z.uuid(),

  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type ItemInput = z.infer<typeof itemSchema>;
