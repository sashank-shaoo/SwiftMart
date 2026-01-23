import { ProductDao } from "../daos/ProductDao";
import { Request, Response } from "express";
import ProductCacheService from "../services/ProductCacheService";

/**
 * Product Discovery & Filtering Controller
 * Endpoints for browsing products by different criteria
 */

/**
 * GET /products/season/:season - Get products by season
 */
export const getProductsBySeason = async (req: Request, res: Response) => {
  try {
    const { season } = req.params;

    const validSeasons = [
      "summer",
      "winter",
      "spring",
      "autumn",
      "monsoon",
      "rainy",
    ];
    if (!validSeasons.includes(season.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid season. Valid values: summer, winter, spring, autumn, monsoon, rainy",
      });
    }

    const products = await ProductDao.findProductsBySeason(
      season.toLowerCase(),
    );

    return res.status(200).json({
      success: true,
      season,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error("Get Products By Season Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get products by season",
      error: error.message,
    });
  }
};

/**
 * GET /products/category/:category_id - Get products by category
 */
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { category_id } = req.params;

    // Try cache first
    const cacheKey = `category:${category_id}`;
    const cached = await ProductCacheService.getProductList(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        from_cache: true,
        count: cached.length,
        products: cached,
      });
    }

    const products = await ProductDao.findProductsByCategory(category_id);

    // Cache for 1 hour
    await ProductCacheService.cacheProductList(cacheKey, products);

    return res.status(200).json({
      success: true,
      category_id,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error("Get Products By Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get products by category",
      error: error.message,
    });
  }
};

/**
 * GET /products/bestsellers - Get best selling products
 */
export const getBestSellers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Try cache first
    const cacheKey = `bestsellers:${limit}`;
    const cached = await ProductCacheService.getProductList(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        from_cache: true,
        count: cached.length,
        products: cached,
      });
    }

    const products = await ProductDao.getBestSellers(limit);

    // Cache for 1 hour
    await ProductCacheService.cacheProductList(cacheKey, products);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error("Get Best Sellers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get best sellers",
      error: error.message,
    });
  }
};

/**
 * GET /products/top-rated - Get highest rated products
 */
export const getTopRated = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Try cache first
    const cacheKey = `toprated:${limit}`;
    const cached = await ProductCacheService.getProductList(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        from_cache: true,
        count: cached.length,
        products: cached,
      });
    }

    const products = await ProductDao.getTopRated(limit);

    // Cache for 1 hour
    await ProductCacheService.cacheProductList(cacheKey, products);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error("Get Top Rated Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get top rated products",
      error: error.message,
    });
  }
};

/**
 * GET /products/new-arrivals - Get recently added products
 */
export const getNewArrivals = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Try cache first
    const cacheKey = `newarrivals:${limit}`;
    const cached = await ProductCacheService.getProductList(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        from_cache: true,
        count: cached.length,
        products: cached,
      });
    }

    const products = await ProductDao.getNewArrivals(limit);

    // Cache for 30 minutes (shorter cache for new arrivals)
    await ProductCacheService.cacheProductList(cacheKey, products);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error("Get New Arrivals Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get new arrivals",
      error: error.message,
    });
  }
};
