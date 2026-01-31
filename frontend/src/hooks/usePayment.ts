"use client";

import { useState } from "react";
import { paymentService } from "@/services/paymentService";
import { Transaction } from "@/types";

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (orderId: string) => {
    setLoading(true);
    try {
      const { url } = await paymentService.checkoutSession(orderId);
      window.location.href = url; // Redirect to Stripe/Gateway
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createCheckoutSession,
  };
}

export function useRevenue() {
  const [earnings, setEarnings] = useState<{
    total_earnings: number;
    balance: number;
    transactions: Transaction[];
  } | null>(null);
  const [revenue, setRevenue] = useState<{
    total_revenue: number;
    total_orders: number;
    recent_transactions: Transaction[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSellerEarnings = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getSellerEarnings();
      setEarnings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminRevenue = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getAdminRevenue();
      setRevenue(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    earnings,
    revenue,
    loading,
    error,
    fetchSellerEarnings,
    fetchAdminRevenue,
  };
}
