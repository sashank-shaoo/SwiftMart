"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/Checkout.module.css";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Lock, MapPin, CreditCard, Package, Mail } from "lucide-react";
import { orderService } from "@/services/orderService";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalItems, clearCart } = useCart();
  const { notifySuccess, notifyError } = useNotification();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  // Redirect if no user or empty cart
  React.useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (items.length === 0) {
      router.push("/cart");
    }
  }, [user, items, router]);

  if (!user || items.length === 0) {
    return <LoadingSpinner fullPage size="lg" />;
  }

  // Calculate pricing
  const subtotal = items.reduce(
    (sum, item) => sum + item.price_at_time * item.quantity,
    0,
  );
  const tax = subtotal * 0.1;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const handlePlaceOrder = async () => {
    // Validate user has location
    if (!user.location || !user.location.coordinates) {
      notifyError(
        "Please add your delivery address in your profile before checkout",
      );
      setTimeout(() => router.push("/profile"), 2000);
      return;
    }

    setIsProcessing(true);
    try {
      // Use unified checkout API with auto-populated user data
      const checkoutResponse = await orderService.checkout(paymentMethod);

      // Clear cart on success
      await clearCart();

      // Redirect to success page with all order IDs
      const orderIds = checkoutResponse.orders.map((o) => o.orderId).join(",");
      router.push(`/checkout/success?orderIds=${orderIds}`);

      // Show success message with order count
      notifySuccess(
        `${checkoutResponse.totalOrders} order(s) placed successfully!`,
      );
    } catch (error: any) {
      notifyError(error.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Checkout</h1>
        <p className={styles.subtitle}>
          Review your order and complete payment
        </p>
      </div>

      <div className={styles.checkoutLayout}>
        <div className={styles.checkoutContent}>
          {/* Auto-populated User Info */}
          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>
              <Package size={20} />
              Order Information
            </h2>

            <div className={styles.infoCard}>
              <div className={styles.infoRow}>
                <div className={styles.infoLabel}>
                  <Mail size={18} />
                  <span>Email</span>
                </div>
                <span className={styles.infoValue}>{user.email}</span>
              </div>

              <div className={styles.infoRow}>
                <div className={styles.infoLabel}>
                  <MapPin size={18} />
                  <span>Delivery Location</span>
                </div>
                <span className={styles.infoValue}>
                  {user.location?.coordinates
                    ? `${user.location.coordinates[1].toFixed(4)}, ${user.location.coordinates[0].toFixed(4)}`
                    : "Not set - Please update in profile"}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>
              <CreditCard size={20} />
              Payment Method
            </h2>

            <div className={styles.paymentOptions}>
              {["Credit Card", "Debit Card", "UPI", "Cash on Delivery"].map(
                (method) => (
                  <label
                    key={method}
                    className={`${styles.paymentOption} ${paymentMethod === method ? styles.selected : ""}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>{method}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Order Items Summary */}
          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>
              <Package size={20} />
              Order Items ({totalItems})
            </h2>

            <div className={styles.itemsPreview}>
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className={styles.checkoutItem}>
                  <img
                    src={
                      item.product?.images[0] !== "image.jpg"
                        ? item.product?.images[0]
                        : "/placeholder.png"
                    }
                    alt={item.product?.name}
                    className={styles.checkoutItemImage}
                  />
                  <div className={styles.checkoutItemDetails}>
                    <p className={styles.checkoutItemName}>
                      {item.product?.name}
                    </p>
                    <p className={styles.checkoutItemQty}>
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className={styles.checkoutItemPrice}>
                    ${(item.price_at_time * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              {items.length > 3 && (
                <p className={styles.moreItems}>
                  +{items.length - 3} more items
                </p>
              )}
            </div>
          </div>

          {/* Place Order Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handlePlaceOrder}
            isLoading={isProcessing}
            disabled={!user.location?.coordinates || isProcessing}
            icon={<Lock size={20} />}
            style={{ width: "100%", marginTop: "24px" }}>
            {!user.location?.coordinates
              ? "Add Delivery Location First"
              : "Place Order & Pay"}
          </Button>

          {!user.location?.coordinates && (
            <p className={styles.locationWarning}>
              ⚠️ Please add your delivery location in your profile to proceed
              with checkout
            </p>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <aside className={styles.checkoutSidebar}>
          <div className={styles.summaryCard}>
            <h3>Order Summary</h3>
            <div className={styles.summaryItems}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({totalItems} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
