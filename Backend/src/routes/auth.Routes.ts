import * as authController from "../controllers/authController";
import * as otpController from "../controllers/otpController";
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { userSchema } from "../validation(ZOD)/UserValidation";
import { sellerSchema } from "../validation(ZOD)/SellerValidation";
import { adminSchema } from "../validation(ZOD)/AdminValidation";

const router = express.Router();

// User Routes
router.post("/register", validate(userSchema), authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", authMiddleware, authController.logOutUser);

// Seller Routes
router.post(
  "/seller/register",
  validate(sellerSchema),
  authController.registerSeller
);
router.post("/seller/login", authController.loginSeller);
router.post("/seller/logout", authMiddleware, authController.logOutSeller);

// Admin Routes
router.post(
  "/admin/register",
  validate(adminSchema),
  authController.registerAdmin
);
router.post("/admin/login", authController.loginAdmin);
router.post("/admin/logout", authMiddleware, authController.logOutAdmin);

// OTP / Email Verification Routes
router.post("/send-verification-otp", otpController.sendVerificationOtp);
router.post("/verify-email", otpController.verifyEmailOtp);
router.post("/request-password-reset", otpController.requestPasswordReset);
router.post("/reset-password", otpController.resetPassword);

export default router;
