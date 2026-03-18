import { ProductDao } from "../daos/ProductDao";
import { Request, Response } from "express";
import { UserDao } from "../daos/UserDao";
import { CategoryDao } from "../daos/CategoryDao";
import { InventoryDao } from "../daos/InventoryDao";
import { UpdateProductInput } from "../validation(ZOD)/ProductValidation";

import ProductCacheService from "../services/ProductCacheService";
import RedisService from "../services/RedisService";
import {
  uploadMultipleImages,
  deleteMultipleImages,
} from "../services/ImageService";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
} from "../utils/errors";

export const createProductWithImages = async (req: Request, res: Response) => {
  let uploadedImageUrls: string[] = [];
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new BadRequestError(
      "At least one product image is required (3-4 images recommended)",
    );
  }

  if (files.length < 3) {
    throw new BadRequestError(
      "Please upload at least 3 images for better product showcase",
    );
  }

  const {
    name,
    description,
    price,
    original_price,
    sku,
    category_id,
    seller_id,
    season,
    attributes,
    initial_stock,
    low_stock_threshold,
  } = req.body;

  if (!name || !category_id || !seller_id) {
    throw new BadRequestError(
      "Missing required fields: name, category_id, and seller_id are required",
    );
  }

  // Validate stock quantity (accept both stock_quantity and initial_stock for compatibility)
  const stockQuantity =
    initial_stock || req.body.stock_quantity
      ? parseInt(initial_stock || req.body.stock_quantity)
      : 0;
  if (isNaN(stockQuantity) || stockQuantity < 0) {
    throw new BadRequestError(
      "stock_quantity must be a non-negative number (0 or greater)",
    );
  }

  const lowStockThreshold = low_stock_threshold
    ? parseInt(low_stock_threshold)
    : 5;
  if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
    throw new BadRequestError(
      "low_stock_threshold must be a non-negative number",
    );
  }

  // Verify seller exists and has seller role
  const seller = await UserDao.findUserById(seller_id);
  if (!seller) {
    throw new NotFoundError("Seller not found");
  }

  if (seller.role !== "seller") {
    throw new ForbiddenError("User is not registered as a seller");
  }

  const category = await CategoryDao.findCategoryById(category_id);
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  if (sku) {
    const existingProduct = await ProductDao.findProductBySku(sku);
    if (existingProduct) {
      throw new ConflictError("Product with this SKU already exists");
    }
  }

  // Upload images
  try {
    uploadedImageUrls = await uploadMultipleImages(files, "products");
  } catch (uploadError) {
    console.error("Image upload error:", uploadError);
    throw new InternalServerError("Failed to upload images to cloud storage");
  }

  let product;
  try {
    product = await ProductDao.createProduct({
      name,
      description,
      images: uploadedImageUrls,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : undefined,
      sku,
      category_id,
      seller_id,
      season,
      attributes: attributes
        ? typeof attributes === "string"
          ? JSON.parse(attributes)
          : attributes
        : undefined,
    });
  } catch (dbError) {
    // Rollback: Delete uploaded images from Cloudinary if error occurs
    console.error("Product creation error:", dbError);
    await deleteMultipleImages(uploadedImageUrls);
    throw new InternalServerError(
      "Failed to create product. Images have been cleaned up.",
    );
  }

  // Inventory creation (MANDATORY for data consistency)
  try {
    let warehouseLocation: string | undefined;
    if (seller.location?.coordinates) {
      const [lng, lat] = seller.location.coordinates;
      warehouseLocation = `${lng},${lat}`;
    }

    console.log(
      `Creating inventory for product ${product.id} with stock: ${stockQuantity}`,
    );

    await InventoryDao.createInventory(
      product.id!,
      stockQuantity,
      lowStockThreshold,
      warehouseLocation,
    );

    console.log(`Inventory created successfully for product ${product.id}`);
  } catch (inventoryError) {
    console.error("Inventory creation failed:", inventoryError);
    console.error("Product ID:", product.id);
    console.error("Stock Quantity:", stockQuantity);
    console.error("Low Stock Threshold:", lowStockThreshold);

    // CRITICAL: Rollback product creation if inventory fails
    // This ensures products always have inventory records
    try {
      await ProductDao.deleteProduct(product.id!);
      await deleteMultipleImages(uploadedImageUrls);
      console.log(`Rolled back product ${product.id} and deleted images`);
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    // Check if it's a unique constraint error
    const error = inventoryError as any;
    if (error.code === "23505") {
      throw new ConflictError(
        `Inventory already exists for this product. This should not happen - please contact support.`,
      );
    }

    throw new InternalServerError(
      `Failed to create inventory for product "${name}". Error: ${error.message || "Unknown error"}`,
    );
  }

  // Invalidate product caches
  await ProductCacheService.invalidateAllProducts();

  return res.success(
    {
      ...product,
      image_count: uploadedImageUrls.length,
    },
    `Product created successfully with ${uploadedImageUrls.length} images`,
    201,
  );
};

export const updateProduct = async (req: Request, res: Response) => {
  let uploadedImageUrls: string[] = [];
  let oldImageUrls: string[] = [];

  const { product_id } = req.params;
  const files = req.files as Express.Multer.File[] | undefined;

  const existingProduct = await ProductDao.findProductById(product_id);
  if (!existingProduct) {
    throw new NotFoundError("Product not found");
  }

  const user = req.user as any;
  if (
    user.id !== existingProduct.seller_id &&
    user.seller_id !== existingProduct.seller_id
  ) {
    throw new ForbiddenError("You can only update your own products");
  }

  // Parse attributes if it's a JSON string (from FormData)
  if (req.body.attributes && typeof req.body.attributes === "string") {
    try {
      req.body.attributes = JSON.parse(req.body.attributes);
    } catch (e) {
      throw new BadRequestError("Invalid JSON format for attributes");
    }
  }

  const {
    name,
    description,
    price,
    original_price,
    sku,
    category_id,
    season,
    attributes,
    stock_quantity,
    low_stock_threshold,
  } = req.body;

  // Validate stock values if provided
  let validatedStockQuantity: number | undefined;
  let validatedLowStockThreshold: number | undefined;

  if (stock_quantity !== undefined) {
    validatedStockQuantity = parseInt(stock_quantity);
    if (isNaN(validatedStockQuantity) || validatedStockQuantity < 0) {
      throw new BadRequestError("stock_quantity must be a non-negative number");
    }
  }

  if (low_stock_threshold !== undefined) {
    validatedLowStockThreshold = parseInt(low_stock_threshold);
    if (isNaN(validatedLowStockThreshold) || validatedLowStockThreshold < 0) {
      throw new BadRequestError(
        "low_stock_threshold must be a non-negative number",
      );
    }
  }

  if (sku && sku !== existingProduct.sku) {
    const existingProductWithSku = await ProductDao.findProductBySku(sku);
    if (existingProductWithSku) {
      throw new ConflictError("Product with this SKU already exists");
    }
  }

  if (category_id && category_id !== existingProduct.category_id) {
    const category = await CategoryDao.findCategoryById(category_id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
  }

  if (files && files.length > 0) {
    try {
      uploadedImageUrls = await uploadMultipleImages(files, "products");
      oldImageUrls = existingProduct.images || [];
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      throw new InternalServerError(
        "Failed to upload new images to cloud storage",
      );
    }
  }

  const updateData: UpdateProductInput = {};

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (original_price !== undefined)
    updateData.original_price = parseFloat(original_price);
  if (sku !== undefined) updateData.sku = sku;
  if (category_id !== undefined) updateData.category_id = category_id;
  if (season !== undefined) updateData.season = season;
  if (attributes !== undefined) {
    updateData.attributes =
      typeof attributes === "string" ? JSON.parse(attributes) : attributes;
  }

  if (uploadedImageUrls.length > 0) {
    (updateData as any).images = uploadedImageUrls;
  }

  let updatedProduct;
  try {
    updatedProduct = await ProductDao.updateProduct(product_id, updateData);

    if (!updatedProduct) {
      if (uploadedImageUrls.length > 0) {
        await deleteMultipleImages(uploadedImageUrls);
      }
      throw new InternalServerError("Failed to update product");
    }

    if (uploadedImageUrls.length > 0 && oldImageUrls.length > 0) {
      await deleteMultipleImages(oldImageUrls);
    }
  } catch (dbError) {
    console.error("Product update error:", dbError);
    if (uploadedImageUrls.length > 0) {
      await deleteMultipleImages(uploadedImageUrls);
    }
    throw new InternalServerError("Failed to update product");
  }

  // Update inventory if stock values provided
  if (
    validatedStockQuantity !== undefined ||
    validatedLowStockThreshold !== undefined
  ) {
    try {
      const inventory = await InventoryDao.getByProductId(product_id);

      if (!inventory) {
        // If inventory doesn't exist, create it (for legacy products)
        console.warn(`Creating missing inventory for product ${product_id}`);
        await InventoryDao.createInventory(
          product_id,
          validatedStockQuantity ?? 0,
          validatedLowStockThreshold ?? 5,
        );
      } else {
        // Update existing inventory
        if (validatedStockQuantity !== undefined) {
          await InventoryDao.setStock(product_id, validatedStockQuantity);
        }
        if (validatedLowStockThreshold !== undefined) {
          await InventoryDao.updateLowStockThreshold(
            product_id,
            validatedLowStockThreshold,
          );
        }
      }
    } catch (inventoryError) {
      console.error("Inventory update error:", inventoryError);
      throw new InternalServerError(
        "Product updated but failed to update inventory. Please try updating stock separately.",
      );
    }
  }

  // Invalidate caches
  await ProductCacheService.invalidateProduct(product_id);
  await ProductCacheService.invalidateAllProducts();

  return res.success(updatedProduct, "Product updated successfully");
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const existingProduct = await ProductDao.findProductById(product_id);

  if (!existingProduct) {
    throw new NotFoundError("Product not found");
  }

  const user = req.user as any;
  if (
    user.id !== existingProduct.seller_id &&
    user.seller_id !== existingProduct.seller_id
  ) {
    throw new ForbiddenError("You can only delete your own products");
  }

  try {
    const inventoryDeleted = await InventoryDao.deleteInventory(product_id);
    if (inventoryDeleted) {
      console.log(`Inventory for product ${product_id} deleted successfully`);
    }
  } catch (inventoryError) {
    console.warn(
      `Failed to delete inventory for product ${product_id}:`,
      inventoryError,
    );
  }

  const deletedProduct = await ProductDao.deleteProduct(product_id);
  if (!deletedProduct) {
    throw new InternalServerError("Failed to delete product");
  }

  // Clean up product images from Cloudinary
  if (existingProduct.images && existingProduct.images.length > 0) {
    try {
      await deleteMultipleImages(existingProduct.images);
      console.log(
        `Deleted ${existingProduct.images.length} images for product ${product_id}`,
      );
    } catch (imageError) {
      console.error(
        `Failed to delete images for product ${product_id}:`,
        imageError,
      );
    }
  }

  // Invalidate caches
  await ProductCacheService.invalidateProduct(product_id);
  await ProductCacheService.invalidateAllProducts();

  return res.success(deletedProduct, "Product deleted successfully");
};

/**
 * GET /products - List all products with pagination
 */
export const getAllProducts = async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "20",
    category_id,
    min_price,
    max_price,
    sort = "newest",
  } = req.query;

  // Create cache key from query params
  const cacheKey = `products:all:${JSON.stringify({ page, limit, category_id, min_price, max_price, sort })}`;

  // Try cache first (5 minutes TTL)
  if (RedisService.isAvailable()) {
    const cached = await RedisService.get(cacheKey);
    if (cached) {
      return res.success(cached, "Products fetched successfully (cached)");
    }
  }

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

  const { products, total } = await ProductDao.findAllProductsWithPagination({
    page: pageNum,
    limit: limitNum,
    category_id: category_id as string,
    min_price: min_price ? parseFloat(min_price as string) : undefined,
    max_price: max_price ? parseFloat(max_price as string) : undefined,
    sort: sort as string,
  });

  const responseData = {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };

  // Cache for 5 minutes
  if (RedisService.isAvailable()) {
    await RedisService.set(cacheKey, responseData, 300);
  }

  return res.success(responseData, "Products retrieved successfully");
};

/**
 * GET /products/:product_id - Get single product with details
 */
export const getProductById = async (req: Request, res: Response) => {
  const { product_id } = req.params;

  // Try cache first
  const cached = await ProductCacheService.getProduct(product_id);
  if (cached) {
    return res.success({ product: cached }, "Product found (cached)");
  }

  const product = await ProductDao.findProductWithDetails(product_id);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  // Cache for next time (30min TTL by default)
  await ProductCacheService.cacheProduct(product_id, product);

  return res.success({ product }, "Product found");
};

/**
 * GET /products/search - Search products using Elasticsearch
 */
export const searchProducts = async (req: Request, res: Response) => {
  const { q, page = "1", limit = "20" } = req.query;

  if (!q) {
    throw new BadRequestError("Search query 'q' is required");
  }

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

  const { products, total } = await ProductDao.searchProducts(
    q as string,
    pageNum,
    limitNum,
  );

  return res.success(
    {
      products,
      total,
      page: pageNum,
      limit: limitNum,
    },
    `Found ${total} products`,
  );
};

/**
 * GET /products/seller/:seller_id - Get all products from a seller
 * Query params: ?metrics=true&sortBy=revenue|units
 */
export const getSellerProducts = async (req: Request, res: Response) => {
  const { seller_id } = req.params;
  const includeMetrics = req.query.metrics === "true";
  const sortBy = (req.query.sortBy as "revenue" | "units") || "revenue";

  const products = await ProductDao.findProductsBySellerId(
    seller_id,
    includeMetrics,
    sortBy,
  );

  return res.success({ products }, `Found ${products.length} products`);
};
