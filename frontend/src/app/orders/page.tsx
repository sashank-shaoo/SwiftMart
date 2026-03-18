"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import OrderCard from "@/components/orders/OrderCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ShoppingBag } from "lucide-react";
import styles from "@/styles/Orders.module.css";

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { filteredOrders, loading, activeTab, setActiveTab } = useOrders();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (loading) return <LoadingSpinner fullPage size="lg" />;

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Orders</h1>
          <p className={styles.subtitle}>Track and manage your orders</p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === "active" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("active")}>
            Active Orders
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "history" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("history")}>
            Order History
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <ShoppingBag size={80} strokeWidth={1.5} />
          <h2>No {activeTab} orders found</h2>
          <p>
            {activeTab === "active"
              ? "You have no active orders at the moment."
              : "You haven't purchased anything yet."}
          </p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </main>
  );
}
