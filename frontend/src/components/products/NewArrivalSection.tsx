"use client";

import React from "react";
import Link from "next/link";
import styles from "@/styles/NewArrivalSection.module.css";
import ProductCard from "./ProductCard";
import { Product } from "@/types";

interface NewArrivalSectionProps {
  products: Product[];
}

export default function NewArrivalSection({
  products,
}: NewArrivalSectionProps) {
  // Display up to 8 products on desktop, 4 on mobile
  const displayProducts = products.slice(0, 8);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>New Arrivals</h2>
        <Link href="/search?sort=newest" className={styles.seeAll}>
          See all
        </Link>
      </div>
      <div className={styles.grid}>
        {displayProducts.map((product) => (
          <div key={product.id} className={styles.cardWrapper}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
