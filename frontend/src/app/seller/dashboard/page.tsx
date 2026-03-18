"use client";

import React from "react";
import Link from "next/link";
import styles from "@/styles/Seller.module.css";
import { useSellerDashboard } from "@/hooks/useSellerDashboard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import ProductSalesTable from "@/components/dashboard/ProductSalesTable";
import {
  Package,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Plus,
  AlertCircle,
} from "lucide-react";

export default function SellerDashboardPage() {
  const { loading, stats, topProducts, salesSortBy, setSalesSortBy, user } =
    useSellerDashboard();

  if (loading) return <LoadingSpinner fullPage size="lg" />;

  if (user?.verification_status !== "verified") {
    return (
      <main className={styles.container}>
        <div className={styles.pendingApproval}>
          <AlertCircle size={80} color="#f59e0b" />
          <h1>Seller Account Pending Approval</h1>
          <p>
            Your seller application is currently under review. You'll be
            notified once an administrator approves your account.
          </p>
          <p className={styles.statusNote}>
            Status: <strong>{user?.verification_status}</strong>
          </p>
          <Link href="/">
            <Button variant="outline" size="lg">
              Return to Home
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Seller Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, {user?.name || "Seller"}!
          </p>
        </div>
        <Link href="/seller/products">
          <Button variant="primary" size="lg" icon={<Plus size={20} />}>
            Add Product
          </Button>
        </Link>
      </div>

      <div className={styles.statsGrid}>
        {[
          {
            icon: <Package size={24} />,
            label: "Total Products",
            value: stats.totalProducts,
            color: "#6366f1",
            bg: "rgba(99,102,241,0.1)",
          },
          {
            icon: <ShoppingBag size={24} />,
            label: "Total Orders",
            value: stats.totalOrders,
            color: "#10b981",
            bg: "rgba(16,185,129,0.1)",
          },
          {
            icon: <TrendingUp size={24} />,
            label: "Pending Orders",
            value: stats.pendingOrders,
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.1)",
          },
          {
            icon: <DollarSign size={24} />,
            label: "Total Revenue",
            value: `$${stats.totalRevenue.toFixed(2)}`,
            color: "#3b82f6",
            bg: "rgba(59,130,246,0.1)",
          },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className={styles.statDetails}>
              <p className={styles.statLabel}>{s.label}</p>
              <h3 className={styles.statValue}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {topProducts.length > 0 && (
        <div className={styles.topProductsSection}>
          <div className={styles.sectionHeader}>
            <h2>Top Selling Products</h2>
            <Link href="/seller/products">
              <Button variant="ghost" size="sm">
                View All Products
              </Button>
            </Link>
          </div>
          <ProductSalesTable
            products={topProducts}
            sortBy={salesSortBy}
            onSortChange={setSalesSortBy}
            limit={5}
          />
        </div>
      )}

      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <Link href="/seller/products">
            <div className={styles.actionCard}>
              <Package size={32} />
              <h3>Manage Products</h3>
              <p>Add, edit, or remove products from your catalog</p>
            </div>
          </Link>
          <Link href="/seller/orders">
            <div className={styles.actionCard}>
              <ShoppingBag size={32} />
              <h3>View Orders</h3>
              <p>Process and manage customer orders</p>
            </div>
          </Link>
          <Link href="/profile">
            <div className={styles.actionCard}>
              <TrendingUp size={32} />
              <h3>Profile Settings</h3>
              <p>Update your seller profile and business details</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
