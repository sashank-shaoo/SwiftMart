"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "@/styles/Products.module.css";
import ProductCard from "@/components/products/ProductCard";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import { Sparkles, Flame, Snowflake, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import Button from "@/components/common/Button";

export default function ProductsPage() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [seasonal, setSeasonal] = useState<Product[]>([]);
  const [premium, setPremium] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscoveryData = async () => {
      setLoading(true);
      try {
        const [newRes, bestRes, winterRes, topRes] = await Promise.all([
          productService.getNewArrivals(),
          productService.getBestSellers(),
          productService.getProductsBySeason("winter"), // Example: assuming winter is current
          productService.getTopRated(),
        ]);

        setNewArrivals(newRes.slice(0, 4));
        setBestSellers(bestRes.slice(0, 4));
        setSeasonal(winterRes.slice(0, 4));
        setPremium(topRes.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch discovery data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscoveryData();
  }, []);

  const Section = ({
    title,
    icon,
    products,
    subtitle,
  }: {
    title: string;
    icon: React.ReactNode;
    products: Product[];
    subtitle: string;
  }) => (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>{icon}</div>
          <div>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <p className={styles.sectionSubtitle}>{subtitle}</p>
          </div>
        </div>
        <Link href={`/search?type=${title.toLowerCase().replace(" ", "-")}`}>
          <Button variant="outline" size="sm">
            View All <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
      <div className={styles.productGrid}>
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}>
            <ProductCard product={p} />
          </motion.div>
        ))}
        {products.length === 0 && !loading && (
          <div className={styles.emptyState}>
            No products found in this category.
          </div>
        )}
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.skeletonPulse}></div>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>
            Discovery <span>Hub</span>
          </h1>
          <p className={styles.pageSubtitle}>
            Explore our most prestigious collections and latest arrivals.
          </p>
        </div>
      </header>

      <div className={styles.container}>
        <Section
          title="New Arrivals"
          icon={<Sparkles size={20} />}
          products={newArrivals}
          subtitle="The latest additions to our curated catalog."
        />

        <Section
          title="Best Selling"
          icon={<Flame size={20} />}
          products={bestSellers}
          subtitle="Most loved by our prestigious community."
        />

        <Section
          title="Seasonal Picks"
          icon={<Snowflake size={20} />}
          products={seasonal}
          subtitle="Perfectly curated for the current atmosphere."
        />

        <Section
          title="Premium Reserve"
          icon={<Star size={20} />}
          products={premium}
          subtitle="Exclusively handpicked for the discerning shopper."
        />
      </div>
    </main>
  );
}
