"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWishlist } from "@/hooks/useWishlist";
import { useNotification } from "@/context/NotificationContext";
import { Heart, Trash2, Package } from "lucide-react";
import styles from "@/styles/Wishlist.module.css";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function WishlistPage() {
  const { notifySuccess, notifyError } = useNotification();
  const { wishlist, loading, removingIds, remove, viewProduct, goToProducts } =
    useWishlist();

  const handleRemove = async (product_id: string) => {
    const ok = await remove(product_id);
    if (ok) notifySuccess("Removed from wishlist");
    else notifyError("Failed to remove item");
  };

  if (loading) return <LoadingSpinner fullPage size="lg" />;

  if (wishlist.length === 0) {
    return (
      <main className={styles.container}>
        <div className={styles.emptyState}>
          <Heart size={64} strokeWidth={1.5} />
          <h2>Your Wishlist is Empty</h2>
          <p>Save items you love to your wishlist and shop them later!</p>
          <Button onClick={goToProducts} icon={<Package size={18} />}>
            Browse Products
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Heart
            size={32}
            fill="var(--color-primary)"
            color="var(--color-primary)"
          />
          <h1 className={styles.title}>My Wishlist</h1>
        </div>
        <p className={styles.itemCount}>
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      <div className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {wishlist.map((item) => (
            <motion.div
              key={item.product_id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={styles.card}>
              <div className={styles.imageWrapper}>
                <img
                  src={item.images[0] || "/placeholder-product.png"}
                  alt={item.name}
                  className={styles.image}
                  onClick={() => viewProduct(item.product_id)}
                />
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemove(item.product_id)}
                  disabled={removingIds.has(item.product_id)}>
                  <Trash2 size={18} />
                </button>
              </div>

              <div className={styles.details}>
                <h3
                  className={styles.productName}
                  onClick={() => viewProduct(item.product_id)}>
                  {item.name}
                </h3>
                <p className={styles.price}>₹{item.price.toLocaleString()}</p>
                <div className={styles.actions}>
                  <Button
                    size="sm"
                    fullWidth
                    onClick={() => viewProduct(item.product_id)}>
                    View Product
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
