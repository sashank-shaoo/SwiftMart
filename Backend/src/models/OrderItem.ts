export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at?: Date;
}
