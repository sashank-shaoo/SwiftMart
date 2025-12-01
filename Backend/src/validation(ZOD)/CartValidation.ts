import { z } from "zod";

export const cartSchema = z.object({
  id: z.uuid().optional(),

  user_id: z.uuid(),
  item_id: z.uuid(),
  seller_id: z.uuid(),

  quantity: z.number().min(1, "Quantity must be at least 1"),

  price_at_time: z.number().min(1, "Price must be at least 1"),

  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type CartInput = z.infer<typeof cartSchema>;
