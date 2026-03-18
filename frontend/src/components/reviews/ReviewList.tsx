"use client";

import React from "react";
import StarRating from "@/components/common/StarRating";
import { Review } from "@/types";
import styles from "@/styles/ReviewList.module.css";

interface ReviewListProps {
  reviews: Review[];
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  currentUserId?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onEdit,
  onDelete,
  currentUserId,
}) => {
  if (reviews.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  const getInitials = (review: Review) => {
    const name = review.name || review.email || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = (review: Review) => {
    return review.name || review.email || "Anonymous";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Customer Reviews ({reviews.length})</h3>

      <div className={styles.list}>
        {reviews.map((review) => {
          const isOwner = currentUserId === review.user_id;

          return (
            <div key={review.id} className={styles.reviewCard}>
              {/* Header */}
              <div className={styles.header}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>{getInitials(review)}</div>
                  <div>
                    <div className={styles.userName}>
                      {getDisplayName(review)}
                      <span className={styles.verifiedBadge}>
                        Verified Buyer
                      </span>
                    </div>
                    <div className={styles.date}>
                      {review.created_at
                        ? formatDate(review.created_at)
                        : "N/A"}
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <div className={styles.actions}>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(review)}
                        className={styles.editButton}>
                        Edit
                      </button>
                    )}
                    {onDelete && review.id && (
                      <button
                        onClick={() => onDelete(review.id!)}
                        className={styles.deleteButton}>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className={styles.rating}>
                <StarRating rating={review.rating} size={18} />
              </div>

              {/* Comment */}
              {review.comment && (
                <p className={styles.comment}>{review.comment}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewList;
