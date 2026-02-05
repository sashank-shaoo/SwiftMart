import { Request, Response, NextFunction } from "express";

/**
 * Sanitize input to prevent XSS attacks
 * Removes common XSS patterns from request body, query, and params
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    const sanitizedQuery = sanitizeObject(req.query);
    for (const key in req.query) {
      delete (req.query as any)[key];
    }
    Object.assign(req.query, sanitizedQuery);
  }

  // Sanitize URL parameters
  if (req.params) {
    const sanitizedParams = sanitizeObject(req.params);
    for (const key in req.params) {
      delete (req.params as any)[key];
    }
    Object.assign(req.params, sanitizedParams);
  }

  next();
};

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize string to prevent XSS
 */
function sanitizeString(str: string): string {
  // Remove script tags
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers
  str = str.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");

  // Remove javascript: protocol
  str = str.replace(/javascript:/gi, "");

  // Trim whitespace
  str = str.trim();

  return str;
}
