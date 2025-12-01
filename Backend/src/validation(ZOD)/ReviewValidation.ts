import { z } from "zod";

export const reviewSchema = z.object({
  id: z.uuid().optional(),

  user_id: z.uuid(),

  item_id: z.uuid(),

  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),

  comment: z
    .string()
    .min(2, "Comment must be at least 2 characters")
    .max(500, "Comment must be less than 500 characters")
    .optional(),

  created_at: z.date().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
