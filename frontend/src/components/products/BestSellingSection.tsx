"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/BestSellingSection.module.css";
import StarRating from "@/components/common/StarRating";
import ProductCard from "./ProductCard"; // Import ProductCard
import { Product } from "@/types";
import { Star } from "lucide-react";

interface BestSellingSectionProps {
  products: Product[];
}

export default function BestSellingSection({
  products,
}: BestSellingSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Display top 4 best-selling products
  const bestSellers = products.slice(0, 4);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Best Selling</h2>
        <Link href="/search?sort=bestselling" className={styles.seeAll}>
          See all
        </Link>
      </div>

      {/* Desktop View - Horizontal Scroll */}
      <div className={styles.desktopView}>
        <div className={styles.scrollContainer} ref={scrollContainerRef}>
          <div className={styles.cardsWrapper}>
            {bestSellers.map((product) => (
              <div key={product.id} className={styles.cardWrapper}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile View - Vertical List */}
      <div className={styles.mobileView}>
        <div className={styles.listWrapper}>
          {bestSellers.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className={styles.horizontalCard}>
              <div className={styles.mobileImageWrapper}>
                <Image
                  src={product.images?.[0] || "/placeholder-product.jpg"}
                  alt={product.name}
                  fill
                  className={styles.productImage}
                  sizes="150px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.mobileCardInfo}>
                <h3 className={styles.mobileProductName}>{product.name}</h3>
                <div className={styles.mobilePriceRating}>
                  <span className={styles.mobilePrice}>
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <div className={styles.mobileRating}>
                    <StarRating rating={product.rating || 0} size={16} />
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
