"use client";

import React, { useState } from "react";
import StarRating from "@/components/common/StarRating";
import { createReview, updateReview } from "@/services/reviewService";
import styles from "@/styles/ReviewForm.module.css";

interface ReviewFormProps {
  productId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  existingReview,
  onSuccess,
  onCancel,
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        await updateReview(existingReview.id, { rating, comment });
      } else {
        await createReview(productId, { rating, comment });
      }

      onSuccess?.();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to submit review. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {existingReview ? "Edit Your Review" : "Write a Review"}
      </h3>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Rating */}
        <div className={styles.field}>
          <label className={styles.label}>Your Rating *</label>
          <StarRating
            rating={rating}
            interactive={true}
            onChange={setRating}
            size={32}
          />
        </div>

        {/* Comment */}
        <div className={styles.field}>
          <label htmlFor="comment" className={styles.label}>
            Your Review (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            className={styles.textarea}
            rows={5}
            maxLength={500}
          />
          <span className={styles.charCount}>{comment.length}/500</span>
        </div>

        {/* Buttons */}
        <div className={styles.actions}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
              disabled={isSubmitting}>
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}>
            {isSubmitting
              ? "Submitting..."
              : existingReview
                ? "Update Review"
                : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
