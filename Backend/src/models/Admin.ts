export interface Admin {
  id?: string;
  name?: string;
  email: string; 
  password: string; 
  number?: string;
  role?: "admin"; 
  created_at?: Date;
  updated_at?: Date;
}
