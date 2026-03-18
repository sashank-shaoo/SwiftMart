import { Request, Response } from "express";
import { ReviewDao } from "../daos/ReviewDao";
import { reviewSchema } from "../validation(ZOD)/ReviewValidation";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../utils/errors";

/**
 * POST /api/products/:product_id/reviews
 * Create a new review for a product
 */
export const createReview = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const user = req.user as any;

  // Validate request body
  const validatedData = reviewSchema.parse({
    ...req.body,
    user_id: user.id,
    product_id,
  });

  // Check if user is the seller of this product (can't review own products)
  const isProductSeller = await ReviewDao.isUserProductSeller(
    user.id,
    product_id,
  );

  if (isProductSeller) {
    throw new ForbiddenError(
      "You cannot review your own product. Only buyers can leave reviews.",
    );
  }

  // Check if user has already reviewed this product
  const hasReviewed = await ReviewDao.hasUserReviewedProduct(
    user.id,
    product_id,
  );

  if (hasReviewed) {
    throw new ConflictError(
      "You have already reviewed this product. You can update your existing review instead.",
    );
  }

  // Create review
  const review = await ReviewDao.createReview({
    product_id,
    user_id: user.id,
    rating: validatedData.rating,
    comment: validatedData.comment,
  });

  // Update product rating stats
  await ReviewDao.updateProductRatingStats(product_id);

  return res.success(review, "Review created successfully", 201);
};

/**
 * GET /api/products/:product_id/reviews
 * Get all reviews for a product
 */
export const getProductReviews = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const { page = "1", limit = "10" } = req.query;

  try {
    const reviews = await ReviewDao.findReviewsByProductId(product_id);

    // Simple pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedReviews = reviews.slice(startIndex, endIndex);

    return res.success(
      {
        reviews: paginatedReviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: reviews.length,
          totalPages: Math.ceil(reviews.length / limitNum),
        },
      },
      "Reviews retrieved successfully",
    );
  } catch (error) {
    console.error("Get reviews error:", JSON.stringify(error, null, 2));
    console.error("Error stack:", error);
    throw error;
  }
};

/**
 * GET /api/users/reviews
 * Get all reviews by the authenticated user
 */
export const getUserReviews = async (req: Request, res: Response) => {
  const user = req.user as any;

  const reviews = await ReviewDao.findReviewsByUserId(user.id);

  return res.success({ reviews }, "User reviews retrieved successfully");
};

/**
 * PATCH /api/reviews/:id
 * Update a review (only by review owner)
 */
export const updateReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as any;

  // Get existing review
  const existingReview = await ReviewDao.findReviewById(id);

  if (!existingReview) {
    throw new NotFoundError("Review not found");
  }

  // Check ownership
  if (existingReview.user_id !== user.id) {
    throw new ForbiddenError("You can only update your own reviews");
  }

  // Validate updates
  const updates = reviewSchema.partial().parse(req.body);

  // Update review
  const updatedReview = await ReviewDao.updateReview(id, updates);

  if (!updatedReview) {
    throw new NotFoundError("Review not found");
  }

  // Update product rating stats
  await ReviewDao.updateProductRatingStats(existingReview.product_id);

  return res.success(updatedReview, "Review updated successfully");
};

/**
 * DELETE /api/reviews/:id
 * Delete a review (only by review owner or admin)
 */
export const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as any;

  // Get existing review
  const existingReview = await ReviewDao.findReviewById(id);

  if (!existingReview) {
    throw new NotFoundError("Review not found");
  }

  // Check ownership or admin
  if (existingReview.user_id !== user.id && user.role !== "admin") {
    throw new ForbiddenError(
      "You can only delete your own reviews (or be an admin)",
    );
  }

  // Delete review
  const deletedReview = await ReviewDao.deleteReview(id);

  if (!deletedReview) {
    throw new NotFoundError("Review not found");
  }

  // Update product rating stats
  await ReviewDao.updateProductRatingStats(existingReview.product_id);

  return res.success(null, "Review deleted successfully");
};
