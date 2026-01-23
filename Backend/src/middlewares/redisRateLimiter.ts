import { Request, Response, NextFunction } from "express";
import RedisService from "../services/RedisService";
import logger from "../config/logger";

/**
 * Redis-based Rate Limiter
 * Distributed rate limiting using Upstash Redis
 */

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
}

/**
 * Create a Redis-based rate limiter middleware
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = "Too many requests, please try again later",
    keyGenerator = (req) => req.ip || "unknown",
  } = options;

  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    // If Redis not available, skip rate limiting (graceful degradation)
    if (!RedisService.isAvailable()) {
      logger.warn("Redis unavailable - rate limiting disabled");
      return next();
    }

    try {
      const key = `ratelimit:${keyGenerator(req)}`;

      // Increment counter
      const current = await RedisService.incr(key);

      // Set expiry on first request
      if (current === 1) {
        await RedisService.expire(key, windowSeconds);
      }

      // Get remaining TTL
      const ttl = await RedisService.ttl(key);

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", max.toString());
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, max - current).toString(),
      );
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(Date.now() + ttl * 1000).toISOString(),
      );

      // Check if limit exceeded
      if (current > max) {
        res.status(429).json({
          success: false,
          message,
          retryAfter: ttl,
        });
        return;
      }

      next();
    } catch (error: any) {
      logger.error(`Rate limiter error: ${error.message}`);
      // On error, allow request (fail open)
      next();
    }
  };
}

/**
 * Pre-configured rate limiters
 */

// Login attempts - 5 per 15 minutes per IP
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again after 15 minutes",
  keyGenerator: (req) => `login:${req.ip}`,
});

// Registration - 3 per hour per IP
export const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Too many registration attempts, please try again after 1 hour",
  keyGenerator: (req) => `register:${req.ip}`,
});

// OTP requests - 3 per hour per email
export const otpRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Too many OTP requests, please try again after 1 hour",
  keyGenerator: (req) => `otp:${req.body.email || req.ip}`,
});

// API general - 100 per 15 minutes per user
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "API rate limit exceeded",
  keyGenerator: (req) => {
    const user = (req as any).user;
    return user ? `api:user:${user.id}` : `api:ip:${req.ip}`;
  },
});
