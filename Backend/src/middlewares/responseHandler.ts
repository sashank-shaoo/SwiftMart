import { Request, Response, NextFunction } from "express";

/**
 * Middleware to attach custom response methods to the Express response object
 */
export const responseHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  /**
   * Standard Success Response
   * @param data Optional response data
   * @param message Success message
   * @param statusCode HTTP status code (default: 200)
   */
  res.success = function (
    data: any = null,
    message: string = "Success",
    statusCode: number = 200,
  ) {
    return this.status(statusCode).json({
      success: true,
      message,
      ...(data !== null && { data }),
    });
  };

  next();
};
