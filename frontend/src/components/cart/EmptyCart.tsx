"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "@/styles/Cart.module.css";
import { ShoppingCart, Package, Sparkles } from "lucide-react";
import Button from "@/components/common/Button";
import Link from "next/link";

const EmptyCart: React.FC = () => {
  return (
    <motion.div
      className={styles.emptyCart}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}>
      <div className={styles.emptyIconWrapper}>
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}>
          <ShoppingCart size={80} strokeWidth={1.5} />
        </motion.div>
      </div>

      <h2 className={styles.emptyTitle}>Your Cart is Empty</h2>
      <p className={styles.emptyText}>
        Looks like you haven't added anything to your cart yet. Start exploring
        our premium collection!
      </p>

      <div className={styles.emptyActions}>
        <Link href="/products">
          <Button variant="primary" size="lg" icon={<Package size={20} />}>
            Browse Products
          </Button>
        </Link>
        <Link href="/products?sort=new">
          <Button variant="outline" size="lg" icon={<Sparkles size={20} />}>
            New Arrivals
          </Button>
        </Link>
      </div>

      <div className={styles.emptyFeatures}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🚀</span>
          <p>Fast Delivery</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🛡️</span>
          <p>Secure Payment</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>↩️</span>
          <p>Easy Returns</p>
        </div>
      </div>
    </motion.div>
  );
};

export default EmptyCart;
