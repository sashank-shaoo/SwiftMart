export interface Wishlist {
  id?: string;
  user_id: string;
  product_id: string;
  created_at?: Date;
}

/**
 * Extended Wishlist interface with product details
 * Used for queries that JOIN with products table
 */
export interface WishlistWithProduct extends Wishlist {
  // Product details from JOIN
  name: string;
  price: number;
  images: string[];
}
