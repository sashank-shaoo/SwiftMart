import { z } from "zod";

export const addToWishlistSchema = z.object({
  product_id: z.uuid("Invalid product ID format"),
});

export const removeFromWishlistSchema = z.object({
  product_id: z.uuid("Invalid product ID format"),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
export type RemoveFromWishlistInput = z.infer<typeof removeFromWishlistSchema>;
