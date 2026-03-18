"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import styles from "@/styles/Cart.module.css";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import EmptyCart from "@/components/cart/EmptyCart";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, updateCartItem, removeFromCart, loading, totalItems } =
    useCart();
  const { notifySuccess, notifyError } = useNotification();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await updateCartItem(itemId, quantity);
      notifySuccess("Cart updated");
    } catch (error) {
      // Error handled by global handler
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
      notifySuccess("Item removed from cart");
    } catch (error) {
      notifyError("Failed to remove item");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const calculateSubtotal = () => {
    return items.reduce(
      (sum, item) => sum + item.price_at_time * item.quantity,
      0,
    );
  };

  if (loading) {
    return <LoadingSpinner fullPage size="lg" />;
  }

  if (items.length === 0) {
    return (
      <main className={styles.container}>
        <EmptyCart />
      </main>
    );
  }

  const subtotal = calculateSubtotal();

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <ShoppingBag size={32} />
          <h1 className={styles.title}>Shopping Cart</h1>
        </div>
        <p className={styles.itemCount}>
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </p>
      </div>

      <div className={styles.cartLayout}>
        <div className={styles.cartItems}>
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                isUpdating={updatingItems.has(item.id!)}
              />
            ))}
          </AnimatePresence>
        </div>

        <aside className={styles.cartSidebar}>
          <CartSummary subtotal={subtotal} itemCount={totalItems} />
        </aside>
      </div>
    </main>
  );
}
