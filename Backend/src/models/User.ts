export interface User {
  id?: string;
  name?: string;
  image?: string;
  age?: number;
  number?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  email: string;
  password: string;
  bio?: string;
  role: "user" | "seller" | "admin"; // Now required, not optional
  is_verified_email?: boolean;
  refresh_token_hash?: string;
  refresh_token_expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}
