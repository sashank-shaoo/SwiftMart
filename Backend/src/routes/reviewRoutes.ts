import { Router } from "express";
import {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/errorHandler";

const router = Router();

// Product reviews
router.post(
  "/products/:product_id/reviews",
  authMiddleware,
  asyncHandler(createReview),
);
router.get("/products/:product_id/reviews", asyncHandler(getProductReviews));

// User reviews
router.get("/users/reviews", authMiddleware, asyncHandler(getUserReviews));

// Individual review operations
router.patch("/reviews/:id", authMiddleware, asyncHandler(updateReview));
router.delete("/reviews/:id", authMiddleware, asyncHandler(deleteReview));

export default router;
