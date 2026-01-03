export interface Order {
  id?: string;
  user_id: string;
  total_amount: number;
  shipping_fee?: number;
  tax_amount?: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  order_status: "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  shipping_address: any; // JSONB
  billing_address?: any; // JSONB
  payment_method?: string;
  transaction_id?: string;
  created_at?: Date;
  updated_at?: Date;
}
