"use client";

import React from "react";
import styles from "@/styles/Orders.module.css";
import { Order } from "@/types";
import { Package, Calendar, DollarSign, Eye } from "lucide-react";
import Link from "next/link";
import Button from "@/components/common/Button";

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const statusColors = {
    pending: "#f59e0b",
    processing: "#3b82f6",
    shipped: "#8b5cf6",
    delivered: "#10b981",
    completed: "#10b981",
    cancelled: "#ef4444",
  };

  const statusColor =
    statusColors[
      (order.order_status || "pending") as keyof typeof statusColors
    ] || "#6b7280";

  return (
    <div className={styles.orderCard}>
      <div className={styles.orderHeader}>
        <div>
          <h3 className={styles.orderId}>Order #{order.id}</h3>
          <div className={styles.orderDate}>
            <Calendar size={16} />
            <span>{new Date(order.created_at || "").toLocaleDateString()}</span>
          </div>
        </div>
        <div
          className={styles.statusBadge}
          style={{ background: `${statusColor}20`, color: statusColor }}>
          {order.order_status}
        </div>
      </div>

      <div className={styles.orderDetails}>
        <div className={styles.orderStat}>
          <Package size={20} />
          <div>
            <span className={styles.statLabel}>Items</span>
            <span className={styles.statValue}>
              {order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
            </span>
          </div>
        </div>

        <div className={styles.orderStat}>
          <DollarSign size={20} />
          <div>
            <span className={styles.statLabel}>Total</span>
            <span className={styles.statValue}>
              ${parseFloat(String(order.total_amount || 0)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.orderActions}>
        <Link href={`/orders/${order.id}`}>
          <Button variant="primary" size="sm" icon={<Eye size={16} />}>
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
