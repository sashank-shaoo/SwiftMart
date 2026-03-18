"use client";

import React, { useState } from "react";
import ReviewSummary from "@/components/reviews/ReviewSummary";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewForm from "@/components/reviews/ReviewForm";
import styles from "@/styles/ReviewsSection.module.css";
import { Review } from "@/types";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReviewsSectionProps {
  productId: string;
  reviews: Review[];
  rating: number;
  reviewCount: number;
  currentUserId?: string;
  onRefresh: () => void;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  productId,
  reviews,
  rating,
  reviewCount,
  currentUserId,
  onRefresh,
}) => {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Show only first 3 reviews on PDP
  const displayedReviews = reviews.slice(0, 3);

  const handleSeeAll = () => {
    router.push(`/products/${productId}/reviews`);
  };

  return (
    <section className={styles.section} id="reviews">
      {isFormOpen ? (
        <ReviewForm
          productId={productId}
          onSuccess={() => {
            setIsFormOpen(false);
            onRefresh();
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      ) : (
        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <ReviewSummary
              rating={rating}
              reviewCount={reviewCount}
              reviews={reviews}
              onWriteReview={() => setIsFormOpen(true)}
            />
          </div>

          <div className={styles.rightColumn}>
            {/* Header for Reviews List */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#0C2C55",
                  margin: 0,
                }}>
                Recent Reviews
              </h3>
              {reviews.length > 3 && (
                <button onClick={handleSeeAll} className={styles.seeAllButton}>
                  See All <ArrowRight size={16} />
                </button>
              )}
            </div>

            <ReviewList
              reviews={displayedReviews}
              currentUserId={currentUserId}
              // Add verify/edit/delete handlers if needed, passing simple version for now
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
