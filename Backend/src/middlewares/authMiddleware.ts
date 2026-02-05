import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

// Auth fuction for default authentication
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (req.signedCookies?.auth_token) {
    token = req.signedCookies.auth_token;
  }

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.error("Not authenticated", 401);
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (err) {
    return res.error("Invalid or expired token", 403);
  }
};

// Seller authentication middleware
export const requireSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.error("Authentication required", 401);
  }

  const user = req.user as any;

  if (user.role !== "seller") {
    return res.error(
      "Access denied. Seller account required to perform this action.",
      403,
    );
  }

  // Check verification_status in database (Security: prevent bypass via old tokens)
  const { SellerProfileDao } = await import("../daos/SellerProfileDao");
  const profile = await SellerProfileDao.findSellerProfileByUserId(user.id);

  if (!profile) {
    return res.error("Seller profile not found.", 404);
  }

  if (profile.verification_status !== "verified") {
    return res.error(
      "Your seller account is pending approval. You will be able to perform this action once an admin verifies your profile.",
      403,
    );
  }

  next();
};

// Admin authentication middleware
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.error("Authentication required", 401);
  }

  const user = req.user as any;

  if (user.account_type !== "admin" && user.role !== "admin") {
    return res.error(
      "Access denied. Admin account required to perform this action.",
      403,
    );
  }

  next();
};

// Seller or Admin authentication middleware
export const requireSellerOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.error("Authentication required", 401);
  }

  const user = req.user as any;
  const accountType = user.account_type || user.role;

  if (accountType !== "seller" && accountType !== "admin") {
    return res.error(
      "Access denied. Seller or Admin account required to perform this action.",
      403,
    );
  }

  next();
};
