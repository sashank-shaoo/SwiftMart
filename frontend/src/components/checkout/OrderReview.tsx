"use client";

import React from "react";
import styles from "@/styles/Checkout.module.css";
import { CartItem } from "@/types";
import { Package, MapPin, CreditCard, Shield } from "lucide-react";

interface OrderReviewProps {
  items: CartItem[];
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

const OrderReview: React.FC<OrderReviewProps> = ({
  items,
  shippingInfo,
  paymentMethod,
  pricing,
}) => {
  return (
    <div className={styles.reviewSection}>
      <h3 className={styles.sectionTitle}>
        <Package size={20} />
        Order Summary
      </h3>

      {/* Items */}
      <div className={styles.reviewItems}>
        {items.map((item) => (
          <div key={item.id} className={styles.reviewItem}>
            <img
              src={
                item.product?.images[0] !== "image.jpg"
                  ? item.product?.images[0]
                  : "/placeholder.png"
              }
              alt={item.product?.name}
              className={styles.reviewItemImage}
            />
            <div className={styles.reviewItemDetails}>
              <h4>{item.product?.name}</h4>
              <p>Quantity: {item.quantity}</p>
            </div>
            <span className={styles.reviewItemPrice}>
              ${(Number(item.price_at_time) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Shipping Address */}
      <div className={styles.reviewInfo}>
        <h4>
          <MapPin size={18} />
          Shipping Address
        </h4>
        <p>
          {shippingInfo.fullName}
          <br />
          {shippingInfo.address}
          <br />
          {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
          <br />
          {shippingInfo.country}
          <br />
          {shippingInfo.phone}
        </p>
      </div>

      {/* Payment Method */}
      <div className={styles.reviewInfo}>
        <h4>
          <CreditCard size={18} />
          Payment Method
        </h4>
        <p className={styles.paymentMethodBadge}>
          {paymentMethod === "card"
            ? "Credit/Debit Card"
            : paymentMethod === "upi"
              ? "UPI"
              : "Digital Wallet"}
        </p>
      </div>

      {/* Pricing Breakdown */}
      <div className={styles.reviewPricing}>
        <div className={styles.pricingRow}>
          <span>Subtotal</span>
          <span>${pricing.subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.pricingRow}>
          <span>Tax</span>
          <span>${pricing.tax.toFixed(2)}</span>
        </div>
        <div className={styles.pricingRow}>
          <span>Shipping</span>
          <span>
            {pricing.shipping === 0
              ? "FREE"
              : `$${pricing.shipping.toFixed(2)}`}
          </span>
        </div>
        <div className={`${styles.pricingRow} ${styles.pricingTotal}`}>
          <span>Total</span>
          <span>${pricing.total.toFixed(2)}</span>
        </div>
      </div>

      <div className={styles.securityNotice}>
        <Shield size={16} />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </div>
  );
};

export default OrderReview;
