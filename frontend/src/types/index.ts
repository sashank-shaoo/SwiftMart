export type UserRole = "user" | "seller" | "admin";

export interface User {
  id: string;
  role: "user" | "seller" | "admin";
  name: string;
  email: string;
  image?: string;
  number?: string;
  age?: number;
  bio?: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  is_verified_email: boolean;
  created_at?: string;
  updated_at?: string;
  verification_status?: "pending" | "verified" | "rejected";
  seller_profile?: SellerProfile;
}

export interface SellerProfile {
  id?: string;
  user_id: string;
  store_name?: string;
  gst_number?: string;
  verification_status?: "pending" | "verified" | "rejected";
  payout_details?: {
    account_holder_name?: string;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    upi_id?: string;
  };
  commission_rate?: number;
  total_earnings?: number;
  current_balance?: number;
  warehouse_location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Inventory {
  id?: string;
  product_id: string;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity?: number;
  low_stock_threshold?: number;
  warehouse_location?: string;
  last_restocked_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id?: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export interface Product {
  id?: string;
  name: string;
  description?: string;
  sku?: string;
  category_id: string;
  price: number;
  original_price?: number;
  images: string[];
  attributes?: Record<string, any>;
  seller_id: string;
  is_active?: boolean;
  tags?: string[];
  season?: string;
  stock_quantity?: number;
  rating?: number;
  review_count?: number;
  category?: Category;
  inventory?: Inventory;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id?: string;
  user_id: string;
  product_id: string;
  seller_id: string;
  quantity: number;
  price_at_time: number;
  product?: Product; // For UI convenience
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// ==================== Wishlist Types ====================

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface WishlistWithProduct extends Wishlist {
  // Product details from JOIN
  name: string;
  price: number;
  images: string[];
}

export interface WishlistResponse {
  wishlist: WishlistWithProduct[];
  count: number;
}

export interface CheckWishlistResponse {
  inWishlist: boolean;
}

export interface Order {
  id?: string;
  user_id: string;
  total_amount: string | number;
  shipping_fee?: number;
  tax_amount?: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  order_status:
    | "processing"
    | "confirmed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "returned";
  status?:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled"; // Frontend alias
  shipping_address: Address | any;
  billing_address?: Address | any;
  payment_method?: string;
  transaction_id?: string;

  // Delivery tracking fields
  shipped_at?: string;
  estimated_delivery_time?: string;
  delivery_distance_km?: number;

  items?: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

// Unified checkout response (multiple orders created)
export interface CheckoutResponse {
  orders: {
    orderId: string;
    sellerId: string;
    total: number;
    sellerEarnings: number;
    platformFee: number;
    transactionId: string;
  }[];
  totalOrders: number;
  totalAmount: number;
  totalPlatformRevenue: number;
}

export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  quantity: number;
  price_at_purchase: number;
  price_at_time?: number; // Frontend alias
  product?: Product;
  created_at?: string;
}

export interface Transaction {
  id?: string;
  order_id: string;
  seller_id: string;
  total_amount: number;
  seller_amount: number;
  platform_amount: number;
  commission_rate: number;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at?: string;
}

export interface AdminStats {
  total_users: number;
  unverified_users: number;
  total_sellers: number;
  pending_sellers: number;
  total_revenue: number;
  active_orders: number;
}

export interface SellerProfit {
  name: string;
  store_name: string;
  total_sales: number;
  total_orders: number;
}

export interface RecentActivity {
  type: "order" | "user";
  name: string;
  value: string | null;
  created_at: string;
}

export interface AdminOverview {
  stats: AdminStats;
  topSellers: SellerProfit[];
  recentActivity: RecentActivity[];
}

export interface AdminAlert {
  id: string;
  type: "SELLER_REGISTRATION" | "SELLER_MIGRATION" | "ORDER_PLACED" | "OTHER";
  message: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

// Review types
export interface Review {
  id?: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  name?: string;
  email?: string;
}

export interface CreateReviewData {
  rating: number;
  comment?: string;
}
