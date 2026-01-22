import { ProductDao } from "../daos/ProductDao";
import { Request, Response } from "express";
import { UserDao } from "../daos/UserDao";
import { CategoryDao } from "../daos/CategoryDao";
import { InventoryDao } from "../daos/InventoryDao";
import { UpdateProductInput } from "../validation(ZOD)/ProductValidation";
import {
  uploadMultipleImages,
  deleteMultipleImages,
} from "../services/ImageService";

export const createProductWithImages = async (req: Request, res: Response) => {
  let uploadedImageUrls: string[] = [];

  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one product image is required (3-4 images recommended)",
      });
    }

    if (files.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least 3 images for better product showcase",
      });
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
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, category_id, and seller_id are required",
      });
    }

    // Verify seller exists and has seller role
    const seller = await UserDao.findUserById(seller_id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "User is not registered as a seller",
      });
    }

    const category = await CategoryDao.findCategoryById(category_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (sku) {
      const existingProduct = await ProductDao.findProductBySku(sku);
      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: "Product with this SKU already exists",
        });
      }
    }

    try {
      uploadedImageUrls = await uploadMultipleImages(files, "products");
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload images to cloud storage",
      });
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
        attributes: attributes ? JSON.parse(attributes) : undefined,
      });
    } catch (dbError) {
      // Rollback: Delete uploaded images from Cloudinary if error occurs
      console.error("Product creation error:", dbError);
      await deleteMultipleImages(uploadedImageUrls);

      return res.status(500).json({
        success: false,
        message: "Failed to create product. Images have been cleaned up.",
      });
    }

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
      console.warn(
        `Product ${product.id} created but inventory creation failed`,
      );
    }

    return res.status(201).json({
      success: true,
      message: `Product created successfully with ${uploadedImageUrls.length} images`,
      data: {
        ...product,
        image_count: uploadedImageUrls.length,
      },
    });
  } catch (error) {
    console.error("Create product with images error:", error);

    if (uploadedImageUrls.length > 0) {
      await deleteMultipleImages(uploadedImageUrls);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  let uploadedImageUrls: string[] = [];
  let oldImageUrls: string[] = [];

  try {
    const { product_id } = req.params;
    const files = req.files as Express.Multer.File[] | undefined;

    const existingProduct = await ProductDao.findProductById(product_id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = req.user as any;
    if (
      user.id !== existingProduct.seller_id &&
      user.seller_id !== existingProduct.seller_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own products",
      });
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
        return res.status(409).json({
          success: false,
          message: "Product with this SKU already exists",
        });
      }
    }

    if (category_id && category_id !== existingProduct.category_id) {
      const category = await CategoryDao.findCategoryById(category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    if (files && files.length > 0) {
      try {
        uploadedImageUrls = await uploadMultipleImages(files, "products");
        oldImageUrls = existingProduct.images || [];
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload new images to cloud storage",
        });
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
        return res.status(500).json({
          success: false,
          message: "Failed to update product",
        });
      }

      if (uploadedImageUrls.length > 0 && oldImageUrls.length > 0) {
        await deleteMultipleImages(oldImageUrls);
      }
    } catch (dbError) {
      console.error("Product update error:", dbError);
      if (uploadedImageUrls.length > 0) {
        await deleteMultipleImages(uploadedImageUrls);
      }
      return res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    if (uploadedImageUrls.length > 0) {
      await deleteMultipleImages(uploadedImageUrls);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const existingProduct = await ProductDao.findProductById(product_id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const user = req.user as any;
    if (
      user.id !== existingProduct.seller_id &&
      user.seller_id !== existingProduct.seller_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own products",
      });
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
      return res.status(500).json({
        success: false,
        message: "Failed to delete product",
      });
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

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};
