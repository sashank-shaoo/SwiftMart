export interface User {
  id?: number;
  name?: string;
  image?: string;
  age?: number;
  number?: string;
  location?: {
    type: 'Point';
    coordinates: number[];
  };
  email: string;
  password?: string;
  bio?: string;
  is_seller_verified?: boolean;
  is_admin_verified?: boolean;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
}
