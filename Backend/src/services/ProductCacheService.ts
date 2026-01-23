import RedisService from "./RedisService";
import logger from "../config/logger";

/**
 * Product Caching Service
 * Cache product details in Redis to reduce database load
 */

class ProductCacheService {
  private readonly PRODUCT_PREFIX = "product:";
  private readonly PRODUCT_LIST_PREFIX = "products:list:";
  private readonly PRODUCT_TTL = 3600 * 24; // 24 hours
  private readonly LIST_TTL = 3600; // 1 hour

  /**
   * Get product cache key
   */
  private getProductKey(productId: string): string {
    return `${this.PRODUCT_PREFIX}${productId}`;
  }

  /**
   * Get product list cache key
   */
  private getListKey(params: string): string {
    return `${this.PRODUCT_LIST_PREFIX}${params}`;
  }

  /**
   * Get cached product
   */
  async getProduct(productId: string): Promise<any | null> {
    if (!RedisService.isAvailable()) return null;

    const key = this.getProductKey(productId);
    const cached = await RedisService.get(key);

    if (cached) {
      logger.debug(`[Cache HIT] Product ${productId}`);
    }

    return cached;
  }

  /**
   * Cache a product
   */
  async cacheProduct(productId: string, productData: any): Promise<void> {
    if (!RedisService.isAvailable()) return;

    const key = this.getProductKey(productId);
    await RedisService.set(key, productData, this.PRODUCT_TTL);
    logger.debug(`[Cache SET] Product ${productId}`);
  }

  /**
   * Invalidate product cache (when product is updated)
   */
  async invalidateProduct(productId: string): Promise<void> {
    const key = this.getProductKey(productId);
    await RedisService.del(key);
    logger.debug(`[Cache INVALIDATE] Product ${productId}`);
  }

  /**
   * Get cached product list
   */
  async getProductList(cacheKey: string): Promise<any[] | null> {
    if (!RedisService.isAvailable()) return null;

    const key = this.getListKey(cacheKey);
    return await RedisService.get(key);
  }

  /**
   * Cache product list
   */
  async cacheProductList(cacheKey: string, products: any[]): Promise<void> {
    if (!RedisService.isAvailable()) return;

    const key = this.getListKey(cacheKey);
    await RedisService.set(key, products, this.LIST_TTL);
    logger.debug(`[Cache SET] Product list: ${cacheKey}`);
  }

  /**
   * Invalidate all product caches (when any product changes)
   */
  async invalidateAllProducts(): Promise<void> {
    await RedisService.delPattern(`${this.PRODUCT_PREFIX}*`);
    await RedisService.delPattern(`${this.PRODUCT_LIST_PREFIX}*`);
    logger.info("[Cache CLEAR] All product caches invalidated");
  }
}

export default new ProductCacheService();
