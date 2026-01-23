import { Response } from "express";

/**
 * Standardized API Response Helpers
 * Provides consistent response format across all endpoints
 */

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  errors?: any[];
}

/**
 * Success Response - 200
 */
export const ok = (
  res: Response,
  data: any = null,
  message: string = "Success",
): Response => {
  const response: ApiResponse = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(200).json(response);
};

/**
 * Created Response - 201
 */
export const created = (
  res: Response,
  data: any = null,
  message: string = "Resource created successfully",
): Response => {
  const response: ApiResponse = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(201).json(response);
};

/**
 * No Content Response - 204
 */
export const noContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Bad Request Error - 400
 */
export const badRequest = (
  res: Response,
  message: string = "Bad request",
  errors: any[] = [],
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  return res.status(400).json(response);
};

/**
 * Unauthorized Error - 401
 */
export const unauthorized = (
  res: Response,
  message: string = "Unauthorized - Please login",
): Response => {
  return res.status(401).json({
    success: false,
    message,
  });
};

/**
 * Forbidden Error - 403
 */
export const forbidden = (
  res: Response,
  message: string = "Forbidden - Insufficient permissions",
): Response => {
  return res.status(403).json({
    success: false,
    message,
  });
};

/**
 * Not Found Error - 404
 */
export const notFound = (
  res: Response,
  message: string = "Resource not found",
): Response => {
  return res.status(404).json({
    success: false,
    message,
  });
};

/**
 * Conflict Error - 409
 */
export const conflict = (
  res: Response,
  message: string = "Resource already exists",
): Response => {
  return res.status(409).json({
    success: false,
    message,
  });
};

/**
 * Unprocessable Entity - 422
 */
export const unprocessableEntity = (
  res: Response,
  message: string = "Validation failed",
  errors: any[] = [],
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  return res.status(422).json(response);
};

/**
 * Too Many Requests - 429
 */
export const tooManyRequests = (
  res: Response,
  message: string = "Too many requests - Please try again later",
  retryAfter?: number,
): Response => {
  if (retryAfter) {
    res.setHeader("Retry-After", retryAfter.toString());
  }

  return res.status(429).json({
    success: false,
    message,
    ...(retryAfter && { retryAfter }),
  });
};

/**
 * Internal Server Error - 500
 */
export const internalError = (
  res: Response,
  message: string = "Internal server error",
  error?: string,
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };

  // Only include error details in development
  if (process.env.NODE_ENV === "development" && error) {
    response.error = error;
  }

  return res.status(500).json(response);
};

/**
 * Service Unavailable - 503
 */
export const serviceUnavailable = (
  res: Response,
  message: string = "Service temporarily unavailable",
): Response => {
  return res.status(503).json({
    success: false,
    message,
  });
};

/**
 * Custom Error Response
 */
export const customError = (
  res: Response,
  statusCode: number,
  message: string,
  data: any = null,
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};
