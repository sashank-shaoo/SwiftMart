export interface Cart {
  id?: string;
  user_id: string;
  product_id: string;
  seller_id: string;
  quantity: number;
  price_at_time: number;
  created_at?: Date;
  updated_at?: Date;
}
