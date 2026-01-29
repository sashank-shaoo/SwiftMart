export interface AdminProfile {
  id?: string;
  user_id: string;
  permissions?: Record<string, boolean>;
  department?: string;
  total_revenue?: number;
  created_at?: Date;
  updated_at?: Date;
}
