import { Request, Response } from "express";
import { CartDao } from "../daos/CartDao";
import { ProductDao } from "../daos/ProductDao";
import { InventoryDao } from "../daos/InventoryDao";
import CartCacheService from "../services/CartCacheService";

export class CartController {
  static async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      // Use Redis cache for cart retrieval (10x faster!)
      const cartItems = await CartCacheService.getCart(userId);

      const subtotal = cartItems.reduce(
        (acc, item) => acc + Number(item.price_at_time) * item.quantity,
        0,
      );

      res.status(200).json({
        success: true,
        data: {
          items: cartItems,
          item_count: cartItems.length,
          subtotal,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch cart",
        error: error.message,
      });
    }
  }

  static async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { product_id, quantity = 1 } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      if (!product_id) {
        res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
        return;
      }

      const product = await ProductDao.findProductById(product_id);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }

      const inventory = await InventoryDao.getByProductId(product_id);
      if (!inventory || inventory.stock_quantity < quantity) {
        res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
        return;
      }

      const existingCart = await CartDao.findCartByUserId(userId);
      const existingItem = existingCart.find(
        (item) => item.product_id === product_id,
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const updated = await CartDao.updateCartQuantity(
          existingItem.id!,
          newQuantity,
        );

        // Update cache
        await CartCacheService.updateCartCache(userId);

        res.status(200).json({
          success: true,
          message: "Cart updated",
          data: updated,
        });
        return;
      }

      const cartItem = await CartDao.addToCart({
        user_id: userId,
        product_id,
        seller_id: product.seller_id,
        quantity,
        price_at_time: product.price,
      });

      // Update cache
      await CartCacheService.updateCartCache(userId);

      res.status(201).json({
        success: true,
        message: "Item added to cart",
        data: cartItem,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to add to cart",
        error: error.message,
      });
    }
  }

  static async updateQuantity(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const { quantity } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      if (!quantity || quantity < 1) {
        res.status(400).json({
          success: false,
          message: "Quantity must be at least 1",
        });
        return;
      }

      const cartItems = await CartDao.findCartByUserId(userId);
      const cartItem = cartItems.find((item) => item.id === id);

      if (!cartItem) {
        res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
        return;
      }

      const inventory = await InventoryDao.getByProductId(cartItem.product_id);
      if (!inventory || inventory.stock_quantity < quantity) {
        res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
        return;
      }

      const updated = await CartDao.updateCartQuantity(id, quantity);

      // Update cache
      await CartCacheService.updateCartCache(userId);

      res.status(200).json({
        success: true,
        message: "Quantity updated",
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to update quantity",
        error: error.message,
      });
    }
  }

  static async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      // Verify ownership
      const cartItems = await CartDao.findCartByUserId(userId);
      const cartItem = cartItems.find((item) => item.id === id);

      if (!cartItem) {
        res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
        return;
      }

      await CartDao.removeFromCart(id);

      // Update cache
      await CartCacheService.updateCartCache(userId);

      res.status(200).json({
        success: true,
        message: "Item removed from cart",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to remove from cart",
        error: error.message,
      });
    }
  }

  static async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      await CartDao.clearCartByUserId(userId);

      // Invalidate cache
      await CartCacheService.invalidateCart(userId);

      res.status(200).json({
        success: true,
        message: "Cart cleared",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to clear cart",
        error: error.message,
      });
    }
  }
}
