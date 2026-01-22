import * as authController from "../controllers/authController";
import * as otpController from "../controllers/otpController";
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

const router = express.Router();

router.post("/login", authController.login);
router.post("/logout", authMiddleware, authController.logout);

router.post("/register", validate(userSchema), authController.registerUser);
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
router.post("/send-verification-otp", otpController.sendVerificationOtp);
router.post("/verify-email", otpController.verifyEmailOtp);
router.post("/request-password-reset", otpController.requestPasswordReset);
router.post("/reset-password", otpController.resetPassword);

export default router;
