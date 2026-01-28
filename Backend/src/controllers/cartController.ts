import { Request, Response } from "express";
import { CartDao } from "../daos/CartDao";
import { ProductDao } from "../daos/ProductDao";
import { InventoryDao } from "../daos/InventoryDao";
import CartCacheService from "../services/CartCacheService";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors";

// Get user's cart
export const getCart = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  // Use Redis cache for cart retrieval (10x faster!)
  const cartItems = await CartCacheService.getCart(userId);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price_at_time) * item.quantity,
    0,
  );

  return res.success(
    {
      items: cartItems,
      item_count: cartItems.length,
      subtotal,
    },
    "Cart fetched successfully",
  );
};

// Add item to cart for users
export const addToCart = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { product_id, quantity = 1 } = req.body;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  if (!product_id) {
    throw new BadRequestError("Product ID is required");
  }

  const product = await ProductDao.findProductById(product_id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const inventory = await InventoryDao.getByProductId(product_id);
  if (!inventory || inventory.stock_quantity < quantity) {
    throw new BadRequestError("Insufficient stock");
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

    return res.success(updated, "Cart updated");
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

  return res.success(cartItem, "Item added to cart", 201);
};

// Update quantity of an item in the cart for users
export const updateQuantity = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  const { quantity } = req.body;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  if (!quantity || quantity < 1) {
    throw new BadRequestError("Quantity must be at least 1");
  }

  const cartItems = await CartDao.findCartByUserId(userId);
  const cartItem = cartItems.find((item) => item.id === id);

  if (!cartItem) {
    throw new NotFoundError("Cart item not found");
  }

  const inventory = await InventoryDao.getByProductId(cartItem.product_id);
  if (!inventory || inventory.stock_quantity < quantity) {
    throw new BadRequestError("Insufficient stock");
  }

  const updated = await CartDao.updateCartQuantity(id, quantity);

  // Update cache
  await CartCacheService.updateCartCache(userId);

  return res.success(updated, "Quantity updated");
};

// Remove item from cart for users
export const removeFromCart = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  // Verify ownership of the cart
  const cartItems = await CartDao.findCartByUserId(userId);
  const cartItem = cartItems.find((item) => item.id === id);

  if (!cartItem) {
    throw new NotFoundError("Cart item not found");
  }

  await CartDao.removeFromCart(id);

  // Update cache
  await CartCacheService.updateCartCache(userId);

  return res.success(null, "Item removed from cart");
};

// Clear cart for users
export const clearCart = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  await CartDao.clearCartByUserId(userId);

  // Invalidate cache
  await CartCacheService.invalidateCart(userId);

  return res.success(null, "Cart cleared");
};
