import RedisService from "./RedisService";
import { CartDao } from "../daos/CartDao";
import logger from "../config/logger";

/**
 * Cart Caching Service
 * Uses Redis for fast cart operations with PostgreSQL fallback
 */

class CartCacheService {
  private readonly CART_PREFIX = "cart:user:";
  private readonly CART_TTL = 3600 * 24 * 7; // 7 days

  /**
   * Get cart key for user
   */
  private getCartKey(userId: string): string {
    return `${this.CART_PREFIX}${userId}`;
  }

  /**
   * Get user's cart (checks Redis first, falls back to DB)
   */
  async getCart(userId: string): Promise<any[]> {
    const cacheKey = this.getCartKey(userId);

    // Try Redis first
    if (RedisService.isAvailable()) {
      const cached = await RedisService.get<any[]>(cacheKey);
      if (cached) {
        logger.debug(`[Cache HIT] Cart for user ${userId}`);
        return cached;
      }
      logger.debug(`[Cache MISS] Cart for user ${userId}`);
    }

    // Fallback to database
    const cartItems = await CartDao.findCartByUserId(userId);

    // Cache for next time (if Redis available)
    if (RedisService.isAvailable() && cartItems.length > 0) {
      await RedisService.set(cacheKey, cartItems, this.CART_TTL);
      logger.debug(`[Cache SET] Cart for user ${userId}`);
    }

    return cartItems;
  }

  /**
   * Invalidate user's cart cache
   */
  async invalidateCart(userId: string): Promise<void> {
    const cacheKey = this.getCartKey(userId);
    await RedisService.del(cacheKey);
    logger.debug(`[Cache INVALIDATE] Cart for user ${userId}`);
  }

  /**
   * Update cart cache after modification
   */
  async updateCartCache(userId: string): Promise<void> {
    // Refresh cache with latest data from DB
    const cartItems = await CartDao.findCartByUserId(userId);
    const cacheKey = this.getCartKey(userId);

    if (RedisService.isAvailable()) {
      await RedisService.set(cacheKey, cartItems, this.CART_TTL);
      logger.debug(`[Cache UPDATE] Cart for user ${userId}`);
    }
  }

  /**
   * Clear all cart caches (admin function)
   */
  async clearAllCarts(): Promise<number> {
    const pattern = `${this.CART_PREFIX}*`;
    const deleted = await RedisService.delPattern(pattern);
    logger.info(`[Cache CLEAR] Deleted ${deleted} cart caches`);
    return deleted;
  }
}

export default new CartCacheService();
