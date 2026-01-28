import { ProductDao } from "../daos/ProductDao";
import { Request, Response } from "express";
import { UserDao } from "../daos/UserDao";
import { CategoryDao } from "../daos/CategoryDao";
import { InventoryDao } from "../daos/InventoryDao";
import { UpdateProductInput } from "../validation(ZOD)/ProductValidation";
import ElasticsearchService from "../services/ElasticsearchService";
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

  // Inventory creation (partial failure handled)
  try {
    let warehouseLocation: string | undefined;
    if (seller.location?.coordinates) {
      const [lng, lat] = seller.location.coordinates;
      warehouseLocation = `${lng},${lat}`;
    }

    await InventoryDao.createInventory(
      product.id!,
      initial_stock ? parseInt(initial_stock) : 0,
      low_stock_threshold ? parseInt(low_stock_threshold) : 5,
      warehouseLocation,
    );
  } catch (inventoryError) {
    console.error("Inventory creation error:", inventoryError);
    // We don't throw here as the product is already created
  }

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

  const {
    name,
    description,
    price,
    original_price,
    sku,
    category_id,
    season,
    attributes,
  } = req.body;

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

  return res.success(
    {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
    "Products retrieved successfully",
  );
};

/**
 * GET /products/:product_id - Get single product with details
 */
export const getProductById = async (req: Request, res: Response) => {
  const { product_id } = req.params;

  const product = await ProductDao.findProductWithDetails(product_id);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return res.success({ product }, "Product found");
};

/**
 * GET /products/search - Search products using Elasticsearch
 */
export const searchProducts = async (req: Request, res: Response) => {
  const {
    q,
    category,
    min_price,
    max_price,
    in_stock,
    page = "1",
    limit = "20",
    sort = "relevance",
  } = req.query;

  if (!q) {
    throw new BadRequestError("Search query 'q' is required");
  }

  const result = await ElasticsearchService.searchProducts({
    query: q as string,
    category: category as string,
    min_price: min_price ? parseFloat(min_price as string) : undefined,
    max_price: max_price ? parseFloat(max_price as string) : undefined,
    in_stock:
      in_stock === "true" ? true : in_stock === "false" ? false : undefined,
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
    sort: sort as "relevance" | "price_asc" | "price_desc" | "newest",
  });

  return res.success(
    {
      products: result.products,
      total: result.total,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    },
    `Found ${result.total} products`,
  );
};

/**
 * GET /products/seller/:seller_id - Get all products from a seller
 */
export const getSellerProducts = async (req: Request, res: Response) => {
  const { seller_id } = req.params;

  const products = await ProductDao.findProductsBySellerId(seller_id);

  return res.success({ products }, `Found ${products.length} products`);
};

// ===== ELASTICSEARCH SYNC HELPER =====
/**
 * Index a product to Elasticsearch (call after create/update)
 */
export const indexProductToElasticsearch = async (productId: string) => {
  try {
    const product = await ProductDao.findProductWithDetails(productId);
    if (product) {
      await ElasticsearchService.indexProduct({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category_name,
        category_id: product.category_id,
        seller_id: product.seller_id,
        seller_name: product.seller_name,
        store_name: product.store_name,
        in_stock: product.in_stock,
        stock_quantity: product.stock_quantity || 0,
        images: product.images,
        created_at: product.created_at,
        updated_at: product.updated_at,
      });
    }
  } catch (error) {
    console.error(`Failed to index product ${productId}:`, error);
  }
};
