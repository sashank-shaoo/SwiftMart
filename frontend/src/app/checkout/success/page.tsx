"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import styles from "@/styles/Checkout.module.css";
import Button from "@/components/common/Button";
import { CheckCircle, Package, Home } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIds = searchParams.get("orderIds")?.split(",") || [];
  const [showConfetti, setShowConfetti] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderIds.length) {
      router.push("/");
      return;
    }

    // Fetch all order details
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await Promise.all(
          orderIds.map((id) => orderService.getOrderDetails(id)),
        );
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Trigger confetti animation
    if (!showConfetti) {
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [orderIds.length, router, showConfetti]);

  if (loading) {
    return <LoadingSpinner fullPage size="lg" />;
  }

  if (!orderIds.length) {
    return null;
  }

  const totalAmount = orders.reduce(
    (sum, o) => sum + Number(o.total_amount),
    0,
  );

  return (
    <main className={styles.successContainer}>
      <motion.div
        className={styles.successCard}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <motion.div
          className={styles.successIcon}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
          <CheckCircle size={80} strokeWidth={2} />
        </motion.div>

        <h1 className={styles.successTitle}>
          {orders.length === 1 ? "Order" : `${orders.length} Orders`} Placed
          Successfully!
        </h1>
        <p className={styles.successMessage}>
          Thank you for your purchase. Your{" "}
          {orders.length === 1 ? "order has" : "orders have"} been confirmed and
          will be shipped soon.
        </p>

        {/* Order Cards */}
        <div className={styles.ordersGrid}>
          {orders.map((order, index) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderCardHeader}>
                <h3>Order #{index + 1}</h3>
                <span className={styles.statusBadge}>
                  {order.payment_status}
                </span>
              </div>
              <div className={styles.orderCardBody}>
                <div className={styles.orderInfoRow}>
                  <span>Order ID:</span>
                  <strong>{order.id?.substring(0, 8)}...</strong>
                </div>
                <div className={styles.orderInfoRow}>
                  <span>Amount:</span>
                  <strong>${Number(order.total_amount).toFixed(2)}</strong>
                </div>
                <div className={styles.orderInfoRow}>
                  <span>Transaction:</span>
                  <span className={styles.transactionId}>
                    {order.transaction_id}
                  </span>
                </div>
              </div>
              <Link href={`/orders/${order.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Package size={16} />}>
                  View Details
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Total Summary */}
        {orders.length > 1 && (
          <div className={styles.orderSummary}>
            <div className={styles.summaryRow}>
              <span>Total Orders:</span>
              <strong>{orders.length}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Total Amount:</span>
              <strong>${totalAmount.toFixed(2)}</strong>
            </div>
          </div>
        )}

        <div className={styles.successActions}>
          <Link href="/orders">
            <Button variant="primary" size="lg" icon={<Package size={20} />}>
              View All Orders
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg" icon={<Home size={20} />}>
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className={styles.successFooter}>
          <p>
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
