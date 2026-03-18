"use client";

import React from "react";
import { useNotification } from "@/context/NotificationContext";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import styles from "@/styles/Orders.module.css";
import { Package, Calendar, DollarSign, User } from "lucide-react";

export default function SellerOrdersPage() {
  const { notifySuccess, notifyError } = useNotification();
  const {
    loading,
    filteredOrders,
    activeTab,
    setActiveTab,
    updatingStatus,
    updateStatus,
  } = useSellerOrders();

  const handleUpdateStatus = async (orderId: string, status: string) => {
    const ok = await updateStatus(orderId, status);
    if (ok) notifySuccess(`Order status updated to ${status}`);
    else notifyError("Failed to update order status");
  };

  if (loading) return <LoadingSpinner fullPage size="lg" />;

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customer Orders</h1>
          <p className={styles.subtitle}>Manage and fulfill customer orders</p>
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
          <Package size={80} strokeWidth={1.5} />
          <h2>No {activeTab} orders found</h2>
          <p>
            {activeTab === "active"
              ? "You have no active orders to fulfill."
              : "No historical orders found."}
          </p>
        </div>
      ) : (
        <div className={styles.sellerOrdersList}>
          {filteredOrders.map((order) => (
            <div key={order.id} className={styles.sellerOrderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <h3 className={styles.orderId}>Order #{order.id}</h3>
                  <div className={styles.orderDate}>
                    <Calendar size={16} />
                    <span>
                      {new Date(order.created_at || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div
                  className={styles.statusBadge}
                  style={{
                    background:
                      order.status === "delivered" ? "#10b98120" : "#3b82f620",
                    color: order.status === "delivered" ? "#10b981" : "#3b82f6",
                  }}>
                  {order.status}
                </div>
              </div>

              <div className={styles.orderDetails}>
                <div className={styles.orderStat}>
                  <User size={20} />
                  <div>
                    <span className={styles.statLabel}>Customer</span>
                    <span className={styles.statValue}>{order.user_id}</span>
                  </div>
                </div>
                <div className={styles.orderStat}>
                  <Package size={20} />
                  <div>
                    <span className={styles.statLabel}>Items</span>
                    <span className={styles.statValue}>
                      {order.items?.reduce(
                        (acc, item) => acc + item.quantity,
                        0,
                      ) || 0}
                    </span>
                  </div>
                </div>
                <div className={styles.orderStat}>
                  <DollarSign size={20} />
                  <div>
                    <span className={styles.statLabel}>Total</span>
                    <span className={styles.statValue}>
                      $
                      {parseFloat(String(order.total_amount || "0")).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {order.status !== "delivered" && order.status !== "cancelled" ? (
                <div className={styles.statusActions}>
                  <label>Update Status:</label>
                  <div className={styles.statusButtons}>
                    {["processing", "shipped", "delivered"].map((status) => (
                      <Button
                        key={status}
                        variant={
                          order.status === status ? "primary" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(String(order.id!), status)
                        }
                        disabled={
                          updatingStatus === String(order.id) ||
                          order.status === status
                        }
                        isLoading={updatingStatus === String(order.id)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.statusActions}>
                  <div
                    style={{
                      color:
                        order.status === "delivered" ? "#10b981" : "#ef4444",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}>
                    {order.status === "delivered" ? (
                      <>
                        <span style={{ fontSize: "1.2em" }}>✓</span> Order
                        Delivered
                      </>
                    ) : (
                      <>Order Cancelled</>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
