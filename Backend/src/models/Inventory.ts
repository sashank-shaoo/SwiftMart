export interface Inventory {
  id?: string;
  product_id: string;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity?: number; 
  low_stock_threshold?: number;
  warehouse_location?: string;
  last_restocked_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}
