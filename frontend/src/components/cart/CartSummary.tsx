"use client";

import React from "react";
import styles from "@/styles/Cart.module.css";
import Button from "@/components/common/Button";
import { ShoppingBag, Tag, CreditCard } from "lucide-react";
import Link from "next/link";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  onCheckout?: () => void;
  isLoading?: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  itemCount,
  onCheckout,
  isLoading = false,
}) => {
  const tax = subtotal * 0.1; // 10% tax estimate
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  return (
    <div className={styles.cartSummary}>
      <h2 className={styles.summaryTitle}>Order Summary</h2>

      <div className={styles.summaryDetails}>
        <div className={styles.summaryRow}>
          <span>Subtotal ({itemCount} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Estimated Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
        </div>
        {subtotal < 50 && (
          <div className={styles.freeShippingNotice}>
            <Tag size={14} />
            <span>Add ${(50 - subtotal).toFixed(2)} for FREE shipping</span>
          </div>
        )}
        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className={styles.summaryActions}>
        <Link href="/checkout">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            icon={<CreditCard size={20} />}>
            Proceed to Checkout
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" size="lg" fullWidth>
            <ShoppingBag size={20} />
            Continue Shopping
          </Button>
        </Link>
      </div>

      <div className={styles.securityBadges}>
        <div className={styles.badge}>
          <img src="/icons/secure.svg" alt="Secure" />
          <span>Secure Checkout</span>
        </div>
        <div className={styles.badge}>
          <img src="/icons/satisfaction.svg" alt="Satisfaction" />
          <span>100% Satisfaction</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
