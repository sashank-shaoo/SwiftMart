export interface Seller {
    id?: number;
    name?: string;
    image?: string;
    email?: string;
    password?: string;
    number?: string;
    location?: {
    type: 'Point';
    coordinates: number[];
    };
    role?: string;
    is_seller_verified?: boolean;
    is_admin_verified?: boolean;
    created_at?: Date;
    updated_at?: Date;
}