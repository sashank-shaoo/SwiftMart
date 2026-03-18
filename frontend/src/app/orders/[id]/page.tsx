"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "@/styles/Orders.module.css";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { orderService } from "@/services/orderService";
import { Order, OrderItem } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import {
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useNotification();

  const [order, setOrder] = useState<(Order & { items: OrderItem[] }) | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (orderId) {
      fetchOrderDetails();
    }
  }, [user, orderId, router]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrderDetails(orderId);
      setOrder(data);
    } catch (error: any) {
      notifyError(error.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(true);
    try {
      await orderService.cancelOrder(orderId);
      notifySuccess("Order cancelled successfully");
      fetchOrderDetails();
    } catch (error: any) {
      notifyError(error.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage size="lg" />;
  }

  if (!order) {
    return (
      <div className={styles.errorState}>
        <Package size={80} />
        <h2>Order Not Found</h2>
        <Link href="/orders">
          <Button variant="primary">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const statusIcons = {
    pending: <Clock size={24} color="#f59e0b" />,
    processing: <Package size={24} color="#3b82f6" />,
    shipped: <Truck size={24} color="#8b5cf6" />,
    delivered: <CheckCircle size={24} color="#10b981" />,
    completed: <CheckCircle size={24} color="#10b981" />,
    cancelled: <XCircle size={24} color="#ef4444" />,
  };

  return (
    <main className={styles.container}>
      <div className={styles.backButton}>
        <Link href="/orders">
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />}>
            Back to Orders
          </Button>
        </Link>
      </div>

      <div className={styles.detailHeader}>
        <div>
          <h1 className={styles.title}>Order #{order.id}</h1>
          <div className={styles.orderMeta}>
            <Calendar size={16} />
            <span>
              Placed on {new Date(order.created_at || "").toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className={styles.statusBadgeLarge}>
          {statusIcons[order.status as keyof typeof statusIcons]}
          <span>{order.status}</span>
        </div>
      </div>

      <div className={styles.detailLayout}>
        {/* Order Items */}
        <div className={styles.detailSection}>
          <h2 className={styles.sectionTitle}>
            <Package size={20} />
            Order Items
          </h2>
          <div className={styles.itemsList}>
            {order.items?.map((item) => (
              <div key={item.id} className={styles.orderItem}>
                <img
                  src={
                    item.product?.images[0] !== "image.jpg"
                      ? item.product?.images[0]
                      : "/placeholder.png"
                  }
                  alt={item.product?.name}
                  className={styles.itemImage}
                />
                <div className={styles.itemDetails}>
                  <h4>{item.product?.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <span className={styles.itemPrice}>
                  $
                  {(
                    (item.price_at_time || item.price_at_purchase || 0) *
                    item.quantity
                  ).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Tracking - Show when shipped */}
        {order.order_status === "shipped" &&
          order.shipped_at &&
          order.estimated_delivery_time && (
            <div className={styles.detailSection}>
              <h2 className={styles.sectionTitle}>
                <Truck size={20} />
                Delivery Tracking
              </h2>
              <div className={styles.deliveryCard}>
                <div className={styles.deliveryInfo}>
                  <div className={styles.deliveryRow}>
                    <span className={styles.label}>Shipped At:</span>
                    <span className={styles.value}>
                      {new Date(order.shipped_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className={styles.deliveryRow}>
                    <span className={styles.label}>Distance:</span>
                    <span className={styles.value}>
                      {order.delivery_distance_km} km
                    </span>
                  </div>
                  <div className={styles.deliveryRow}>
                    <span className={styles.label}>Estimated Delivery:</span>
                    <span className={styles.value}>
                      {new Date(order.estimated_delivery_time).toLocaleString(
                        "en-IN",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        },
                      )}
                    </span>
                  </div>
                  <div className={styles.deliveryRow}>
                    <span className={styles.label}>Time Remaining:</span>
                    <span className={styles.highlight}>
                      {(() => {
                        const eta = new Date(order.estimated_delivery_time);
                        const now = new Date();
                        const diffMs = eta.getTime() - now.getTime();
                        const diffMins = Math.floor(diffMs / 60000);

                        if (diffMins < 0) return "Arriving soon";
                        if (diffMins < 60) return `${diffMins} minutes`;
                        const hours = Math.floor(diffMins / 60);
                        const mins = diffMins % 60;
                        return `${hours}h ${mins}m`;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className={styles.timeline}>
                  <div className={`${styles.timelineItem} ${styles.completed}`}>
                    <div className={styles.dot}></div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineTitle}>Order Placed</p>
                      <p className={styles.timelineTime}>
                        {new Date(order.created_at || "").toLocaleString(
                          "en-IN",
                          { dateStyle: "short", timeStyle: "short" },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className={`${styles.timelineItem} ${styles.completed}`}>
                    <div className={styles.dot}></div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineTitle}>Payment Confirmed</p>
                      <p className={styles.timelineTime}>
                        {new Date(order.created_at || "").toLocaleString(
                          "en-IN",
                          { dateStyle: "short", timeStyle: "short" },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className={`${styles.timelineItem} ${styles.completed}`}>
                    <div className={styles.dot}></div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineTitle}>Shipped</p>
                      <p className={styles.timelineTime}>
                        {new Date(order.shipped_at).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <div className={styles.dot}></div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineTitle}>Estimated Delivery</p>
                      <p className={styles.timelineTime}>
                        {new Date(order.estimated_delivery_time).toLocaleString(
                          "en-IN",
                          {
                            dateStyle: "short",
                            timeStyle: "short",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Sidebar */}
        <div className={styles.detailSidebar}>
          {/* Shipping Address */}
          <div className={styles.infoCard}>
            <h3>
              <MapPin size={18} />
              Shipping Address
            </h3>
            <p className={styles.address}>
              {order.shipping_address?.fullName ||
              order.shipping_address?.coordinates ? (
                order.shipping_address?.fullName ? (
                  <>
                    {order.shipping_address.fullName}
                    <br />
                    {order.shipping_address.address}
                    <br />
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state}{" "}
                    {order.shipping_address.zipCode}
                    <br />
                    {order.shipping_address.country}
                    <br />
                    {order.shipping_address.phone}
                  </>
                ) : (
                  <>
                    <span style={{ color: "#64748b" }}>
                      Location set via GPS (Exact Address Pending)
                    </span>
                    <br />
                    <a
                      href={`https://www.google.com/maps?q=${order.shipping_address?.coordinates?.[1]},${order.shipping_address?.coordinates?.[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#6366f1",
                        fontSize: "0.9em",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "4px",
                      }}>
                      <MapPin size={14} />
                      View on Map
                    </a>
                  </>
                )
              ) : (
                <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                  No address provided
                </span>
              )}
            </p>
          </div>

          {/* Payment Info */}
          <div className={styles.infoCard}>
            <h3>
              <CreditCard size={18} />
              Payment Method
            </h3>
            <p>{order.payment_method || "N/A"}</p>
          </div>

          {/* Order Summary */}
          <div className={styles.summaryCard}>
            <h3>Order Summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>
                $
                {(parseFloat(String(order.total_amount || 0)) * 0.9).toFixed(2)}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>Tax (10%)</span>
              <span>
                $
                {(parseFloat(String(order.total_amount || 0)) * 0.1).toFixed(2)}
              </span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>
                ${parseFloat(String(order.total_amount || 0)).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          {order.status === "pending" && (
            <Button
              variant="outline"
              onClick={handleCancelOrder}
              isLoading={cancelling}
              style={{
                color: "#ef4444",
                borderColor: "#ef4444",
                width: "100%",
              }}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
