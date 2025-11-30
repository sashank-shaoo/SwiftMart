export interface Review {
  id?: string;
  item_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at?: Date;
}
