export interface Admin {
  id?: string;
  name?: string;
  email: string;
  password: string;
  number?: string;
  role?: "admin";
  refresh_token_hash?: string;
  refresh_token_expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}
