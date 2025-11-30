export interface Item {
  id?: string;
  name: string;
  image: string;
  price: number;

  description?: string;
  category?: string;
  season?: "summer" | "winter" | "spring" | "autumn" | "monsoon" | "rainy";

  seller_id: string;

  created_at?: Date;
  updated_at?: Date;
}
