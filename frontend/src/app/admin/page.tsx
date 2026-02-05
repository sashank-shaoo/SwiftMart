"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { adminService } from "@/services/adminService";
import { AdminOverview, AdminAlert } from "@/types";
import styles from "@/styles/Admin.module.css";
import {
  Users,
  Store,
  Package,
  DollarSign,
  Bell,
  TrendingUp,
  Activity,
  ArrowRight,
  UserPlus,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { notifyError, notifySuccess } = useNotification();
  const router = useRouter();

  const [data, setData] = useState<AdminOverview | null>(null);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/profile");
      return;
    }

    if (user && user.role === "admin") {
      loadDashboardData();
    }
  }, [user, loading, router]);

  const loadDashboardData = async () => {
    try {
      setFetching(true);
      const [dashData, alertData] = await Promise.all([
        adminService.getOverview(),
        adminService.getAlerts(),
      ]);
      setData(dashData);
      setAlerts(alertData);
    } catch (err) {
      console.error("Dashboard data load failure:", err);
    } finally {
      setFetching(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await adminService.markAlertRead(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      notifySuccess("Alert cleared");
    } catch (err) {
      notifyError("Failed to update alert");
    }
  };

  const handleApproveSeller = async (userId: string, alertId: string) => {
    try {
      await adminService.approveSeller(userId);
      await adminService.markAlertRead(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      notifySuccess("Seller approved successfully!");
      loadDashboardData(); // Refresh stats
    } catch (err: any) {
      // Errors are handled by globalNotify in apiClient
    }
  };

  if (loading || fetching || !data) {
    return (
      <div
        className={styles.adminWrapper}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}>
        <p>Syncing Command Center with SwiftMart Node...</p>
      </div>
    );
  }

  const { stats, topSellers, recentActivity } = data;

  return (
    <div className={styles.adminWrapper}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>System Overview</h1>
          <p style={{ color: "var(--color-secondary)" }}>
            Welcome back, Master Admin {user?.name?.split(" ")[0]}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button
            variant="outline"
            size="sm"
            icon={<Activity size={18} />}
            onClick={loadDashboardData}>
            Sync Node
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={<Users size={24} />}
          label="Total Users"
          value={stats.total_users.toLocaleString()}
          alert={
            stats.unverified_users > 0
              ? `${stats.unverified_users} Unverified`
              : undefined
          }
          delay={0.1}
        />
        <StatCard
          icon={<Store size={24} />}
          label="Total Sellers"
          value={stats.total_sellers.toLocaleString()}
          alert={
            stats.pending_sellers > 0
              ? `${stats.pending_sellers} Pending`
              : undefined
          }
          delay={0.2}
        />
        <StatCard
          icon={<Package size={24} />}
          label="Active Orders"
          value={stats.active_orders.toLocaleString()}
          delay={0.3}
        />
        <StatCard
          icon={<DollarSign size={24} />}
          label="Total Revenue"
          value={`$${Number(stats.total_revenue).toLocaleString()}`}
          delay={0.4}
        />
      </div>

      <div className={styles.dashboardGrid}>
        {/* Top Sellers Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className={styles.panelCard}>
          <h3 className={styles.panelTitle}>
            <TrendingUp size={24} color="var(--color-primary)" />
            Top Performing Sellers
          </h3>

          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Total Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSellers.map((seller, idx) => (
                  <tr key={idx}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {seller.store_name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--color-muted)",
                          }}>
                          {seller.name}
                        </div>
                      </div>
                    </td>
                    <td>{seller.total_orders}</td>
                    <td className={styles.profitText}>
                      ${Number(seller.total_sales).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Alerts & Recent Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className={styles.panelCard}>
            <h3 className={styles.panelTitle}>
              <ShieldAlert size={24} color="#ef4444" />
              Critical Alerts
              {alerts.length > 0 && (
                <span className={styles.notificationBadge}>
                  {alerts.length}
                </span>
              )}
            </h3>

            <div className={styles.activityList}>
              <AnimatePresence>
                {alerts.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1rem",
                      color: "var(--color-muted)",
                    }}>
                    <CheckCircle
                      size={32}
                      style={{ marginBottom: "0.5rem", opacity: 0.3 }}
                    />
                    <p>All clear! No pending alerts.</p>
                  </div>
                ) : (
                  alerts.map((a) => (
                    <motion.div
                      key={a.id}
                      exit={{ opacity: 0, height: 0 }}
                      className={styles.activityItem}>
                      <div
                        className={styles.activityIcon}
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          color: "#ef4444",
                        }}>
                        <AlertCircle size={18} />
                      </div>
                      <div className={styles.activityInfo}>
                        <span className={styles.activityText}>{a.message}</span>
                        {a.metadata && (
                          <div className={styles.alertMetadata}>
                            {a.metadata.store_name && (
                              <span>
                                <strong>Store:</strong> {a.metadata.store_name}
                              </span>
                            )}
                            {a.metadata.email && (
                              <span>
                                <strong>Email:</strong> {a.metadata.email}
                              </span>
                            )}
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "4px",
                          }}>
                          <span className={styles.activityTime}>
                            <Clock size={12} style={{ marginRight: "4px" }} />
                            {new Date(a.created_at).toLocaleTimeString()}
                          </span>
                          <button
                            onClick={() => markAsRead(a.id)}
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--color-muted)",
                              fontWeight: 700,
                              marginRight: "12px",
                            }}>
                            Dismiss
                          </button>
                          {(a.type === "SELLER_REGISTRATION" ||
                            a.type === "SELLER_MIGRATION") &&
                            a.metadata?.user_id && (
                              <button
                                onClick={() =>
                                  handleApproveSeller(a.metadata.user_id, a.id)
                                }
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--color-primary)",
                                  fontWeight: 700,
                                  padding: "4px 8px",
                                  border: "1px solid var(--color-primary)",
                                  borderRadius: "4px",
                                }}>
                                Approve Seller
                              </button>
                            )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className={styles.panelCard}>
            <h3 className={styles.panelTitle}>
              <Activity size={24} color="var(--color-secondary)" />
              Full Activity Feed
            </h3>

            <div className={styles.activityList}>
              {recentActivity.map((activity, idx) => (
                <div key={idx} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    {activity.type === "order" ? (
                      <ShoppingBag size={18} />
                    ) : (
                      <UserPlus size={18} />
                    )}
                  </div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityText}>
                      <strong>{activity.name}</strong>
                      {activity.type === "order"
                        ? ` placed an order for $${activity.value}`
                        : " joined SwiftMart!"}
                    </span>
                    <span className={styles.activityTime}>
                      <Clock size={12} style={{ marginRight: "4px" }} />
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              fullWidth
              size="sm"
              style={{ marginTop: "1rem" }}
              icon={<ArrowRight size={16} />}>
              View System Logs
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  delay,
  alert,
}: {
  icon: any;
  label: string;
  value: string;
  delay: number;
  alert?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {alert && <span className={styles.alertBadge}>{alert}</span>}
    </motion.div>
  );
}
