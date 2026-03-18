"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export function useSellerDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [salesSortBy, setSalesSortBy] = useState<"revenue" | "units">(
    "revenue",
  );

  // Access guard
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "seller") {
      router.push("/");
      return;
    }
    if (user.verification_status !== "verified") {
      setLoading(false);
      return;
    }
    loadDashboardData();
  }, [user, router]);

  // Reload top products when sort changes
  useEffect(() => {
    if (user?.id && user.verification_status === "verified") {
      productService
        .getSellerProductsWithMetrics(user.id, salesSortBy)
        .then((data) => setTopProducts(data.slice(0, 5)))
        .catch(console.error);
    }
  }, [salesSortBy, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData, productsWithMetrics, earningsData] =
        await Promise.all([
          productService.getSellerProducts(user?.id!),
          orderService.getSellerOrders(),
          productService.getSellerProductsWithMetrics(user?.id!, salesSortBy),
          orderService.getSellerEarnings(),
        ]);

      setStats({
        totalProducts: productsData.length,
        totalOrders: ordersData.orders.length,
        pendingOrders: ordersData.orders.filter(
          (o: any) =>
            o.order_status === "pending" || o.order_status === "processing",
        ).length,
        totalRevenue: earningsData.total_earnings,
      });
      setTopProducts(productsWithMetrics.slice(0, 5));
    } catch (err: any) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, stats, topProducts, salesSortBy, setSalesSortBy, user };
}
