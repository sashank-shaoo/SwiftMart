"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/PremiumSection.module.css";
import StarRating from "@/components/common/StarRating";
import { Product } from "@/types";

interface PremiumSectionProps {
  products: Product[];
}

export default function PremiumSection({ products }: PremiumSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Display top 4 highest-priced products
  const premiumProducts = products.slice(0, 4);

  return (
    <section className={styles.section}>
      {/* Section Header with Title and See All */}
      <div className={styles.header}>
        <h2 className={styles.title}>Premium Collection</h2>
        <Link href="/products?sort=price_desc" className={styles.seeAllLink}>
          See all
        </Link>
      </div>

      <div className={styles.scrollContainer} ref={scrollContainerRef}>
        <div className={styles.cardsWrapper}>
          {premiumProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={styles.premiumCard}>
              <div className={styles.cardHeader}>
                <div className={styles.rating}>
                  <StarRating rating={product.rating || 0} size={16} />
                </div>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.imageSection}>
                  <Image
                    src={product.images?.[0] || "/placeholder-product.jpg"}
                    alt={product.name}
                    fill
                    className={styles.productImage}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <div className={styles.detailsSection}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productDescription}>
                    {product.description || "Premium quality product"}
                  </p>
                  <div className={styles.priceWrapper}>
                    <span className={styles.price}>
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className={styles.badge}>Premium</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
