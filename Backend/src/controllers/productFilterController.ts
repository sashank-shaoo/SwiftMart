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
 * Query params: ?limit=10&randomize=true (for random selection)
 *               ?page=1&limit=20 (for pagination)
 */
export const getBestSellers = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const randomize = req.query.randomize === "true";
  const page = req.query.page ? parseInt(req.query.page as string) : undefined;

  // If page is specified, use pagination
  if (page) {
    const { products, total } = await ProductDao.getBestSellersWithPagination({
      page,
      limit,
    });

    return res.success(
      {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Best sellers fetched",
    );
  }

  // Otherwise use simple limit with optional randomization
  // Try cache only if not randomizing
  if (!randomize) {
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
  }

  const products = await ProductDao.getBestSellers(limit, randomize);

  // Cache only non-randomized results
  if (!randomize) {
    const cacheKey = `bestsellers:${limit}`;
    await ProductCacheService.cacheProductList(cacheKey, products);
  }

  return res.success(
    {
      count: products.length,
      products,
      randomized: randomize,
    },
    "Best sellers fetched",
  );
};

/**
 * GET /products/top-rated - Get highest rated products
 * Query params: ?limit=10&randomize=true (for random selection)
 *               ?page=1&limit=20 (for pagination)
 */
export const getTopRated = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const randomize = req.query.randomize === "true";
  const page = req.query.page ? parseInt(req.query.page as string) : undefined;

  // If page is specified, use pagination
  if (page) {
    const { products, total } = await ProductDao.getTopRatedWithPagination({
      page,
      limit,
    });

    return res.success(
      {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Top rated products fetched",
    );
  }

  // Otherwise use simple limit with optional randomization
  // Try cache only if not randomizing
  if (!randomize) {
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
  }

  const products = await ProductDao.getTopRated(limit, randomize);

  // Cache only non-randomized results
  if (!randomize) {
    const cacheKey = `toprated:${limit}`;
    await ProductCacheService.cacheProductList(cacheKey, products);
  }

  return res.success(
    {
      count: products.length,
      products,
      randomized: randomize,
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

/**
 * GET /products/premium - Get premium (high-priced) products
 * Query params: ?limit=10&randomize=true (for random selection)
 *               ?page=1&limit=20 (for pagination)
 */
export const getPremiumProducts = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const randomize = req.query.randomize === "true";
  const page = req.query.page ? parseInt(req.query.page as string) : undefined;

  // If page is specified, use pagination
  if (page) {
    const { products, total } =
      await ProductDao.getPremiumProductsWithPagination({
        page,
        limit,
      });

    return res.success(
      {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Premium products fetched",
    );
  }

  // Otherwise use simple limit with optional randomization
  // Try cache only if not randomizing
  if (!randomize) {
    const cacheKey = `premium:${limit}`;
    const cached = await ProductCacheService.getProductList(cacheKey);

    if (cached) {
      return res.success(
        {
          from_cache: true,
          count: cached.length,
          products: cached,
        },
        "Premium products fetched",
      );
    }
  }

  const products = await ProductDao.getPremiumProducts(limit, randomize);

  // Cache only non-randomized results
  if (!randomize) {
    const cacheKey = `premium:${limit}`;
    await ProductCacheService.cacheProductList(cacheKey, products);
  }

  return res.success(
    {
      count: products.length,
      products,
      randomized: randomize,
    },
    "Premium products fetched",
  );
};

/**
 * GET /admin/products/sales - Get best-selling products by actual sales (Admin only)
 * Query params: ?limit=20&sortBy=revenue (or sortBy=units)
 *               ?page=1&limit=20&sortBy=revenue (for pagination)
 */
export const getBestSellersBySales = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const sortBy = (req.query.sortBy as "units" | "revenue") || "revenue";
  const page = req.query.page ? parseInt(req.query.page as string) : undefined;

  // If page is specified, use pagination
  if (page) {
    const { products, total } =
      await ProductDao.getBestSellersBySalesWithPagination({
        page,
        limit,
        sortBy,
      });

    return res.success(
      {
        products,
        sortBy,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Sales analytics fetched",
    );
  }

  // Otherwise return top selling products
  const products = await ProductDao.getBestSellersBySales(limit, sortBy);

  return res.success(
    {
      count: products.length,
      products,
      sortBy,
    },
    "Sales analytics fetched",
  );
};
