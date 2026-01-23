import * as authController from "../controllers/authController";
import * as otpController from "../controllers/otpController";
import * as locationController from "../controllers/locationController";
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import {
  userSchema,
  UpdateUserSchema,
  ChangePasswordSchema,
} from "../validation(ZOD)/UserValidation";
import {
  CreateSellerProfileSchema,
  RegisterSellerSchema,
} from "../validation(ZOD)/SellerProfileValidation";
import { CreateAdminProfileSchema } from "../validation(ZOD)/AdminProfileValidation";
import {
  loginLimiter,
  registerLimiter,
  otpLimiter,
} from "../middlewares/rateLimitMiddleware";

const router = express.Router();

router.post("/login", loginLimiter, authController.login);
router.post("/logout", authMiddleware, authController.logout);

router.post(
  "/register",
  registerLimiter,
  validate(userSchema),
  authController.registerUser,
);
router.post(
  "/become-seller",
  authMiddleware,
  validate(CreateSellerProfileSchema),
  authController.becomeSeller,
);
router.put(
  "/update",
  authMiddleware,
  validate(UpdateUserSchema),
  authController.updateUser,
);

// ===== Email Update Routes (separate from profile updates for security) =====
router.post(
  "/request-email-update",
  authMiddleware,
  authController.requestEmailUpdate,
);
router.post(
  "/verify-email-update",
  authMiddleware,
  authController.verifyEmailUpdate,
);

// ===== Password & Token Management Routes =====
router.post(
  "/change-password",
  authMiddleware,
  validate(ChangePasswordSchema),
  authController.changePassword,
);
router.post("/refresh-token", authController.refreshToken);

// ===== Seller Routes =====
router.post(
  "/seller/register",
  registerLimiter,
  validate(RegisterSellerSchema),
  authController.registerSeller,
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
  otpController.sendVerificationOtp,
);
router.post("/verify-email", otpController.verifyEmailOtp);
router.post(
  "/request-password-reset",
  otpLimiter,
  otpController.requestPasswordReset,
);
router.post("/reset-password", otpController.resetPassword);

// ===== Location Routes (Mapbox Integration) =====
router.post(
  "/update-location",
  authMiddleware,
  locationController.updateUserLocation,
);
router.get("/location", authMiddleware, locationController.getUserLocation);
router.post(
  "/calculate-distance",
  authMiddleware,
  locationController.calculateDeliveryDistance,
);

export default router;
