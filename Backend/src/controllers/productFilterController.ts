import { ProductDao } from "../daos/ProductDao";
import { Request, Response } from "express";
import ProductCacheService from "../services/ProductCacheService";
import { BadRequestError } from "../utils/errors";

/**
 * Product Discovery & Filtering Controller
 * Endpoints for browsing products by different criteria
 */

/**
 * GET /products/season/:season - Get products by season
 */
export const getProductsBySeason = async (req: Request, res: Response) => {
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
    throw new BadRequestError(
      "Invalid season. Valid values: summer, winter, spring, autumn, monsoon, rainy",
    );
  }

  const products = await ProductDao.findProductsBySeason(season.toLowerCase());

  return res.success(
    {
      season,
      count: products.length,
      products,
    },
    "Products fetched by season",
  );
};

/**
 * GET /products/category/:category_id - Get products by category
 */
export const getProductsByCategory = async (req: Request, res: Response) => {
  const { category_id } = req.params;

  // Try cache first
  const cacheKey = `category:${category_id}`;
  const cached = await ProductCacheService.getProductList(cacheKey);

  if (cached) {
    return res.success(
      {
        from_cache: true,
        count: cached.length,
        products: cached,
      },
      "Products fetched by category",
    );
  }

  const products = await ProductDao.findProductsByCategory(category_id);

  // Cache for 1 hour
  await ProductCacheService.cacheProductList(cacheKey, products);

  return res.success(
    {
      category_id,
      count: products.length,
      products,
    },
    "Products fetched by category",
  );
};

/**
 * GET /products/bestsellers - Get best selling products
 */
export const getBestSellers = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  // Try cache first
  const cacheKey = `bestsellers:${limit}`;
  const cached = await ProductCacheService.getProductList(cacheKey);

  if (cached) {
    return res.success(
      {
        from_cache: true,
        count: cached.length,
        products: cached,
      },
      "Best sellers fetched",
    );
  }

  const products = await ProductDao.getBestSellers(limit);

  // Cache for 1 hour
  await ProductCacheService.cacheProductList(cacheKey, products);

  return res.success(
    {
      count: products.length,
      products,
    },
    "Best sellers fetched",
  );
};

/**
 * GET /products/top-rated - Get highest rated products
 */
export const getTopRated = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  // Try cache first
  const cacheKey = `toprated:${limit}`;
  const cached = await ProductCacheService.getProductList(cacheKey);

  if (cached) {
    return res.success(
      {
        from_cache: true,
        count: cached.length,
        products: cached,
      },
      "Top rated products fetched",
    );
  }

  const products = await ProductDao.getTopRated(limit);

  // Cache for 1 hour
  await ProductCacheService.cacheProductList(cacheKey, products);

  return res.success(
    {
      count: products.length,
      products,
    },
    "Top rated products fetched",
  );
};

/**
 * GET /products/new-arrivals - Get recently added products
 */
export const getNewArrivals = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  // Try cache first
  const cacheKey = `newarrivals:${limit}`;
  const cached = await ProductCacheService.getProductList(cacheKey);

  if (cached) {
    return res.success(
      {
        from_cache: true,
        count: cached.length,
        products: cached,
      },
      "New arrivals fetched",
    );
  }

  const products = await ProductDao.getNewArrivals(limit);

  // Cache for 30 minutes (shorter cache for new arrivals)
  await ProductCacheService.cacheProductList(cacheKey, products);

  return res.success(
    {
      count: products.length,
      products,
    },
    "New arrivals fetched",
  );
};
