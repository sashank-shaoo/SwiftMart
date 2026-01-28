import * as authController from "../controllers/authController";
import * as otpController from "../controllers/otpController";
import * as locationController from "../controllers/locationController";
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { asyncHandler } from "../middlewares/errorHandler";
import {
  userSchema,
  UpdateUserSchema,
  ChangePasswordSchema,
} from "../validation(ZOD)/UserValidation";
import {
  CreateSellerProfileSchema,
  RegisterSellerSchema,
} from "../validation(ZOD)/SellerProfileValidation";
import {
  loginLimiter,
  registerLimiter,
  otpLimiter,
} from "../middlewares/rateLimitMiddleware";

const router = express.Router();

router.post("/login", loginLimiter, asyncHandler(authController.login));
router.post("/logout", authMiddleware, asyncHandler(authController.logout));

router.post(
  "/register",
  registerLimiter,
  validate(userSchema),
  asyncHandler(authController.registerUser),
);
router.post(
  "/become-seller",
  authMiddleware,
  validate(CreateSellerProfileSchema),
  asyncHandler(authController.becomeSeller),
);
router.put(
  "/update",
  authMiddleware,
  validate(UpdateUserSchema),
  asyncHandler(authController.updateUser),
);

// ===== Email Update Routes (separate from profile updates for security) =====
router.post(
  "/request-email-update",
  authMiddleware,
  asyncHandler(authController.requestEmailUpdate),
);
router.post(
  "/verify-email-update",
  authMiddleware,
  asyncHandler(authController.verifyEmailUpdate),
);

// ===== Password & Token Management Routes =====
router.post(
  "/change-password",
  authMiddleware,
  validate(ChangePasswordSchema),
  asyncHandler(authController.changePassword),
);
router.post("/refresh-token", asyncHandler(authController.refreshToken));

// ===== Seller Routes =====
router.post(
  "/seller/register",
  registerLimiter,
  validate(RegisterSellerSchema),
  asyncHandler(authController.registerSeller),
);

//Disabled for now
// // ===== Admin Routes =====
// router.post(
//   "/admin/register",
//   authController.registerAdmin, // Restricted endpoint, should require super-admin auth
// );

// ===== OTP / Email Verification Routes =====
router.post(
  "/send-verification-otp",
  otpLimiter,
  asyncHandler(otpController.sendVerificationOtp),
);
router.post("/verify-email", asyncHandler(otpController.verifyEmailOtp));
router.post(
  "/request-password-reset",
  otpLimiter,
  asyncHandler(otpController.requestPasswordReset),
);
router.post("/reset-password", asyncHandler(otpController.resetPassword));

// ===== Location Routes (Mapbox Integration) =====
router.post(
  "/update-location",
  authMiddleware,
  asyncHandler(locationController.updateUserLocation),
);
router.get(
  "/location",
  authMiddleware,
  asyncHandler(locationController.getUserLocation),
);
router.post(
  "/calculate-distance",
  authMiddleware,
  asyncHandler(locationController.calculateDeliveryDistance),
);

export default router;
