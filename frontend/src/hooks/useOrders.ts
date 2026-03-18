"use client";

import { useState, useEffect, useCallback } from "react";
import { Order } from "@/types";
import { orderService } from "@/services/orderService";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  const checkout = async (paymentMethod: string, shippingAddress?: any) => {
    setLoading(true);
    try {
      const order = await orderService.checkout(paymentMethod, shippingAddress);
      setOrders((prev) => [order as unknown as Order, ...prev]);
      return order;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await orderService.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, order_status: "cancelled" as const } : o,
        ),
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const HISTORY_STATUSES = ["delivered", "cancelled", "returned", "completed"];

  const filteredOrders = orders.filter((order) => {
    const isHistory = HISTORY_STATUSES.includes(order.order_status || "");
    return activeTab === "history" ? isHistory : !isHistory;
  });

  return {
    orders,
    loading,
    error,
    activeTab,
    setActiveTab,
    filteredOrders,
    checkout,
    cancelOrder,
    refreshOrders: fetchMyOrders,
  };
}

export function useSellerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSellerOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getSellerOrders();
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSellerOrders();
  }, [fetchSellerOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, order_status: status as any } : o,
        ),
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    updateStatus,
    refreshOrders: fetchSellerOrders,
  };
}
