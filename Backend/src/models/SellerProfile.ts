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
  created_at?: Date;
  updated_at?: Date;
}
