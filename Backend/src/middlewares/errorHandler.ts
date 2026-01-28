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
  res.status(statusCode).json({
    success: false,
    message,
    ...(err instanceof AppError &&
      err.errorCode && { errorCode: err.errorCode }),
    ...(err instanceof AppError && err.details && { details: err.details }),
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  });
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
