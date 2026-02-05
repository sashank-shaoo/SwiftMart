import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

/**
 * Global error handler middleware
 * Catches all errors and sends consistent error responses
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Default error values
  let statusCode = 500;
  let message = "Internal Server Error";
  let isOperational = false;

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }
  // PostgreSQL unique violation
  if ((err as any).code === "23505") {
    statusCode = 409;
    message = "Resource already exists";
  }
  // PostgreSQL foreign key violation
  if ((err as any).code === "23503") {
    statusCode = 400;
    message = "Invalid reference";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Multer Errors (File uploads)
  if (err.name === "MulterError") {
    statusCode = 400;
    const multerErr = err as any;
    if (multerErr.code === "LIMIT_FILE_SIZE") {
      message = "File too large (Max limit per image is 5MB)";
    } else if (multerErr.code === "LIMIT_FILE_COUNT") {
      message = "Too many files (Max 4 images allowed per product)";
    } else if (multerErr.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Too many images uploaded (Max 4 allowed)";
    } else {
      message = `Upload error: ${multerErr.message}`;
    }
  }

  // Log error with Winston
  if (!isOperational || statusCode === 500) {
    const logger = require("../config/logger").default;
    logger.error(
      `${statusCode} - ${message} - ${req.method} ${req.originalUrl}`,
      {
        error: err.message,
        stack: err.stack,
      },
    );
  }

  // Send error response
  res.error(message, statusCode, err instanceof AppError ? err.details : null);
};

// No Route found helper
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
