export interface Transaction {
  id?: string;
  order_id: string;
  seller_id: string;
  total_amount: number;
  seller_amount: number;
  platform_amount: number; // Commission/Revenue for admin
  commission_rate: number;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at?: Date;
}
