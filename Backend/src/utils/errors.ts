/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode?: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    details?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errorCode = errorCode;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(
    message: string = "Bad Request",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 400, errorCode, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message: string = "Unauthorized",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 401, errorCode, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message: string = "Forbidden",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 403, errorCode, details);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = "Not Found",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 404, errorCode, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict", errorCode?: string, details?: any) {
    super(message, 409, errorCode, details);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = "Validation Failed",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 422, errorCode, details);
  }
}

export class InternalServerError extends AppError {
  constructor(
    message: string = "Internal Server Error",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 500, errorCode, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    message: string = "Too Many Requests",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 429, errorCode, details);
  }
}
