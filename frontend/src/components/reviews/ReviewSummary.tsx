"use client";

import React from "react";
import styles from "@/styles/ReviewSummary.module.css";
import { Star } from "lucide-react";
import { Review } from "@/types";

interface ReviewSummaryProps {
  rating: number;
  reviewCount: number;
  reviews: Review[];
  onWriteReview: () => void;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  rating,
  reviewCount,
  reviews,
  onWriteReview,
}) => {
  // Calculate distribution from available reviews
  // Note: Ideally this comes from backend summary stats
  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  reviews.forEach((r) => {
    const star = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
    if (star >= 1 && star <= 5) {
      distribution[star]++;
    }
  });

  // If no reviews, avoid division by zero
  const totalCalculated = reviews.length || 1;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Customer Voices</h3>

      <div className={styles.ratingOverview}>
        <span className={styles.bigRating}>
          {Number(rating || 0).toFixed(1)}
        </span>
        <div className={styles.starGroup}>
          <div style={{ display: "flex" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                fill={star <= Math.round(rating) ? "#0C2C55" : "#E2E8F0"}
                stroke="#0C2C55"
                strokeWidth={0} // Solid fill style for this specific component usually looks cleaner, or match the new gradient star
              />
            ))}
            {/* Note: In a real implementation we might reuse StarRating here but with specific sizing */}
          </div>
          <span className={styles.totalReviews}>
            BASED ON {reviewCount} REVIEWS
          </span>
        </div>
      </div>

      <div className={styles.breakdown}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star as keyof typeof distribution];
          const percent = Math.round((count / totalCalculated) * 100);

          return (
            <div key={star} className={styles.breakdownRow}>
              <span className={styles.starLabel}>{star}</span>
              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className={styles.percentage}>{percent}%</span>
            </div>
          );
        })}
      </div>

      <button className={styles.writeButton} onClick={onWriteReview}>
        Write a Review
      </button>
    </div>
  );
};

export default ReviewSummary;
