"use client";

import React from "react";
import styles from "@/styles/Products.module.css";
import { useProductsPage } from "@/hooks/useProductsPage";
import HeroCarousel from "@/components/products/HeroCarousel";
import CategoryIcons from "@/components/products/CategoryIcons";
import NewArrivalSection from "@/components/products/NewArrivalSection";
import PremiumSection from "@/components/products/PremiumSection";
import BestSellingSection from "@/components/products/BestSellingSection";
import SeasonalPickSection from "@/components/products/SeasonalPickSection";

const heroImages = [
  "/Product/images/young-man-using-his-mobile-phone-street.jpg",
  "/Product/images/10626306.jpg",
  "/Product/images/6859025.jpg",
];

export default function ProductsPage() {
  const { newArrivals, bestSellers, premium, loading } = useProductsPage();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.skeletonPulse}></div>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.heroWrapper}>
        <HeroCarousel images={heroImages} autoPlayInterval={5000} />
      </div>
      <CategoryIcons />
      <NewArrivalSection products={newArrivals} />
      <PremiumSection products={premium} />
      <BestSellingSection products={bestSellers} />
      <SeasonalPickSection />
    </main>
  );
}
