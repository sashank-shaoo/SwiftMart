import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
    interface Response {
      success(data?: any, message?: string, statusCode?: number): this;
    }
  }
}
