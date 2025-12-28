import { z } from "zod";

export const categorySchema = z.object({
  id: z.uuid().optional(),

  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name must be at most 100 characters"),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .max(100, "Slug must be at most 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),

  parent_id: z.uuid().optional(),

  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
