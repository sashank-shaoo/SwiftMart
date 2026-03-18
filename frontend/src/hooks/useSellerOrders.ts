"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";

const HISTORY_STATUSES = ["delivered", "cancelled", "returned", "completed"];

export function useSellerOrders() {
  const router = useRouter();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Access guard
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "seller" || user.verification_status !== "verified") {
      router.push("/");
      return;
    }
    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getSellerOrders();
      setOrders(data.orders);
    } catch (err: any) {
      console.error("Failed to load seller orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      fetchOrders();
      return true;
    } catch {
      return false;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const isHistory = HISTORY_STATUSES.includes(order.order_status || "");
    return activeTab === "history" ? isHistory : !isHistory;
  });

  return {
    loading,
    orders,
    filteredOrders,
    activeTab,
    setActiveTab,
    updatingStatus,
    updateStatus,
  };
}
