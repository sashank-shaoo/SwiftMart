export interface Notification {
  id?: string;
  type: "SELLER_REGISTRATION" | "SELLER_MIGRATION" | "ORDER_PLACED" | "OTHER";
  message: string;
  metadata?: any;
  is_read?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
