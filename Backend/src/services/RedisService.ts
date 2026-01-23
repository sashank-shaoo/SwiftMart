import { Redis } from "@upstash/redis";
import logger from "../config/logger";

/**
 * Redis Service for Upstash (REST API)
 * Uses REST API instead of native Redis protocol
 */

class RedisService {
  private client: Redis | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      if (
        !process.env.UPSTASH_REDIS_REST_URL ||
        !process.env.UPSTASH_REDIS_REST_TOKEN
      ) {
        logger.warn(
          "⚠️  Upstash Redis not configured - Redis features disabled",
        );
        logger.warn(
          "   Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env",
        );
        return;
      }

      // Create Upstash Redis client (REST API)
      this.client = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      this.isConfigured = true;
      logger.info("✅ Upstash Redis configured (REST API)");
    } catch (error: any) {
      logger.error(`❌ Redis initialization failed: ${error.message}`);
    }
  }

  isAvailable(): boolean {
    return this.client !== null && this.isConfigured;
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isAvailable()) return null;

    try {
      const value = await this.client!.get(key);
      if (!value) return null;

      return value as T;
    } catch (error: any) {
      logger.error(`Redis GET error for key ${key}: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      if (ttl) {
        await this.client!.setex(key, ttl, value);
      } else {
        await this.client!.set(key, value);
      }

      return true;
    } catch (error: any) {
      logger.error(`Redis SET error for key ${key}: ${error.message}`);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client!.del(key);
      return true;
    } catch (error: any) {
      logger.error(`Redis DEL error for key ${key}: ${error.message}`);
      return false;
    }
  }

  async delPattern(pattern: string): Promise<number> {
    if (!this.isAvailable()) return 0;

    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length === 0) return 0;

      await this.client!.del(...keys);
      return keys.length;
    } catch (error: any) {
      logger.error(`Redis DEL pattern error for ${pattern}: ${error.message}`);
      return 0;
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.isAvailable()) return 0;

    try {
      return await this.client!.incr(key);
    } catch (error: any) {
      logger.error(`Redis INCR error for key ${key}: ${error.message}`);
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client!.expire(key, seconds);
      return true;
    } catch (error: any) {
      logger.error(`Redis EXPIRE error for key ${key}: ${error.message}`);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error: any) {
      logger.error(`Redis EXISTS error for key ${key}: ${error.message}`);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.isAvailable()) return -1;

    try {
      return await this.client!.ttl(key);
    } catch (error: any) {
      logger.error(`Redis TTL error for key ${key}: ${error.message}`);
      return -1;
    }
  }
}

export default new RedisService();
