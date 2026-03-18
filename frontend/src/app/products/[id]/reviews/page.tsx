"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/AllReviews.module.css";
import { Product, Review } from "@/types";
import { productService } from "@/services/productService";
import { getProductReviews } from "@/services/reviewService";
import ReviewList from "@/components/reviews/ReviewList";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ChevronRight, Star, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AllReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<number | "all">("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch product info
        const productData = await productService.getProductById(productId);
        setProduct(productData);

        // Fetch all reviews (using high limit for now as we do client-side filtering)
        // In a real app with pagination, we'd pass filter to backend
        const reviewsData = await getProductReviews(productId, 1, 100);
        setReviews(reviewsData.reviews);
        setFilteredReviews(reviewsData.reviews);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

  // Handle Filtering
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredReviews(reviews);
    } else {
      const filtered = reviews.filter(
        (r) => Math.round(r.rating) === activeFilter,
      );
      setFilteredReviews(filtered);
    }
  }, [activeFilter, reviews]);

  if (loading) return <LoadingSpinner fullPage size="lg" />;
  if (!product) return null;

  // Calculate counts for sidebar
  const getCount = (rating: number | "all") => {
    if (rating === "all") return reviews.length;
    return reviews.filter((r) => Math.round(r.rating) === rating).length;
  };

  return (
    <main className={styles.container}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Link href="/products">Products</Link>
        <ChevronRight size={14} />
        <Link href={`/products/${productId}`}>{product.name}</Link>
        <ChevronRight size={14} />
        <span>Reviews</span>
      </nav>

      <h1 className={styles.pageTitle}>All Reviews</h1>

      <div className={styles.layout}>
        {/* Sidebar Filters */}
        <aside className={styles.filters}>
          <div className={styles.filterTitle}>
            <Filter size={18} style={{ display: "inline", marginRight: 8 }} />
            Filter by Rating
          </div>
          <div className={styles.filterList}>
            <button
              className={`${styles.filterButton} ${
                activeFilter === "all" ? styles.activeFilter : ""
              }`}
              onClick={() => setActiveFilter("all")}>
              <span>All Reviews</span>
              <span className={styles.count}>{getCount("all")}</span>
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                className={`${styles.filterButton} ${
                  activeFilter === star ? styles.activeFilter : ""
                }`}
                onClick={() => setActiveFilter(star)}>
                <div className={styles.starRow}>
                  <span>{star} Stars</span>
                </div>
                <span className={styles.count}>{getCount(star)}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Reviews List */}
        <div className={styles.content}>
          <div className={styles.resultsHeader}>
            <span>
              Showing <strong>{filteredReviews.length}</strong> reviews
              {activeFilter !== "all" && ` with ${activeFilter} stars`}
            </span>
          </div>

          <ReviewList reviews={filteredReviews} currentUserId={user?.id} />
        </div>
      </div>
    </main>
  );
}
