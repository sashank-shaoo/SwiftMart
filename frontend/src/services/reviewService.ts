import { apiFetch } from "@/lib/apiClient";
import { Review, CreateReviewData } from "@/types";

/**
 * Create a review for a product
 */
export const createReview = async (
  productId: string,
  data: CreateReviewData,
): Promise<Review> => {
  const result = await apiFetch(`/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  // Backend returns {success: true, data: review}
  // apiFetch returns just the review object
  return result;
};

/**
 * Get all reviews for a product
 */
export const getProductReviews = async (
  productId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ reviews: Review[]; pagination: any }> => {
  const result = await apiFetch(
    `/products/${productId}/reviews?page=${page}&limit=${limit}`,
  );
  // apiFetch already returns result.data, so result is {reviews: [], pagination: {}}
  return result;
};

/**
 * Get user's own reviews
 */
export const getUserReviews = async (): Promise<Review[]> => {
  const result = await apiFetch("/users/reviews");
  // Backend returns {success: true, data: {reviews: [...]}}
  // apiFetch returns {reviews: [...]}
  return result.reviews;
};

/**
 * Update a review
 */
export const updateReview = async (
  reviewId: string,
  data: Partial<CreateReviewData>,
): Promise<Review> => {
  const result = await apiFetch(`/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  // Backend returns {success: true, data: review}
  // apiFetch returns just the review object
  return result;
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
  await apiFetch(`/reviews/${reviewId}`, {
    method: "DELETE",
  });
};
