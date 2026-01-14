export interface Inventory {
  id?: string;
  product_id: string;
  quantity_available: number;
  quantity_reserved: number;
  updated_at?: Date;
}
