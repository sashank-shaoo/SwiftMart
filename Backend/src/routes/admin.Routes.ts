import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { authMiddleware, requireAdmin } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/errorHandler";
import { getBestSellersBySales } from "../controllers/productFilterController";

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

/**
 * @route GET /api/admin/overview
 * @desc Get system-wide statistics and activity
 */
router.get("/overview", asyncHandler(AdminController.getDashboardOverview));

/**
 * @route GET /api/admin/alerts
 * @desc Get unread admin notifications/alerts
 */
router.get("/alerts", asyncHandler(AdminController.getAdminAlerts));

/**
 * @route PATCH /api/admin/alerts/:id/read
 * @desc Mark a specific alert as read
 */
router.patch("/alerts/:id/read", asyncHandler(AdminController.markAlertAsRead));

/**
 * @route GET /api/admin/pending-sellers
 * @desc Get all pending seller applications
 */
router.get("/pending-sellers", asyncHandler(AdminController.getPendingSellers));

/**
 * @route PATCH /api/admin/sellers/:userId/approve
 * @desc Approve a pending seller application
 */
router.patch(
  "/sellers/:userId/approve",
  asyncHandler(AdminController.approveSeller),
);

/**
 * @route GET /api/admin/products/sales
 * @desc Get best-selling products by actual sales (revenue/units)
 * @query ?sortBy=revenue|units&limit=20&page=1
 */
router.get("/products/sales", asyncHandler(getBestSellersBySales));

export default router;
