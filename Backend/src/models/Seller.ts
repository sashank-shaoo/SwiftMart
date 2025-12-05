export interface Seller {
  id?: string;
  name?: string;
  image?: string;
  email: string;
  password: string;
  number?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  role?: "seller" | "admin";
  is_seller_verified?: boolean;
  is_admin_verified?: boolean;
  is_verified_email?: boolean;
  refresh_token_hash?: string;
  refresh_token_expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}
