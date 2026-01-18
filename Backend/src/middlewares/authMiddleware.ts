import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

// Auth fuction for default authentication
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (req.signedCookies?.auth_token) {
    token = req.signedCookies.auth_token;
  }

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Seller authentication middleware
export const requireSeller = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  const user = req.user as any;

  if (user.account_type !== "seller" && user.role !== "seller") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Seller account required to perform this action.",
    });
  }

  next();
};

// Admin authentication middleware
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  const user = req.user as any;

  if (user.account_type !== "admin" && user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin account required to perform this action.",
    });
  }

  next();
};

// Seller or Admin authentication middleware 
export const requireSellerOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  const user = req.user as any;
  const accountType = user.account_type || user.role;

  if (accountType !== "seller" && accountType !== "admin") {
    return res.status(403).json({
      success: false,
      error:
        "Access denied. Seller or Admin account required to perform this action.",
    });
  }

  next();
};
