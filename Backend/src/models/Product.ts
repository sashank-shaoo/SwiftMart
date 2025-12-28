export interface Product {
  id?: string;
  name: string;
  description?: string;
  sku?: string;
  category_id: string;
  price: number;
  original_price?: number;
  images: string[]; // Array of image URLs stored as JSONB
  attributes?: Record<string, any>; // Flexible attributes like size, color, etc.
  seller_id: string;
  season?: "summer" | "winter" | "spring" | "autumn" | "monsoon" | "rainy";
  rating?: number;
  review_count?: number;
  created_at?: Date;
  updated_at?: Date;
}
