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
  created_at?: Date;
  updated_at?: Date;
}
