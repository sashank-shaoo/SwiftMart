import { z } from "zod";

export const itemSchema =z.object({
  id: z.number().optional(),
  name: z
    .string()
    .trim()
    .min(4, "Name must be at least 4 characters")
    .max(10, "Name must be at least 10 characters")
    .optional(),
  image: z.string().url("Invalid URL"),
  price: z
    .number()
    .min(100, "Price must be at least 100")
    .max(1000000, "Price must be at least 1000000"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  rating: z.number().optional(),
  review: z.string().optional(),
  category: z.string().optional(),
  season: z.string().optional(),
  seller_id: z.number().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});
