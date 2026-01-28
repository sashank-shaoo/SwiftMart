import { Request, Response } from "express";
import { OrderDao } from "../daos/OrderDao";
import { OrderItemDao } from "../daos/OrderItemDao";
import { CartDao } from "../daos/CartDao";
import { UserDao } from "../daos/UserDao";
import { Order } from "../models/Order";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  InternalServerError,
} from "../utils/errors";

/**
 * Process checkout and create an order
 * POST /api/orders/checkout
 */
export const checkout = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { paymentMethod } = req.body;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized: User not found");
  }

  if (!paymentMethod) {
    throw new BadRequestError("Payment method is required");
  }

  // 1. Get cart items
  const cartItems = await CartDao.findCartByUserId(userId);
  if (cartItems.length === 0) {
    throw new BadRequestError("Cannot checkout with an empty cart");
  }

  // 2. Get user location for default shipping address
  const user = await UserDao.findUserById(userId);
  if (!user) {
    throw new NotFoundError("User profile not found");
  }

  // 3. Calculate totals
  const totalAmount = cartItems.reduce(
    (acc, item) => acc + Number(item.price_at_time) * item.quantity,
    0,
  );

  // 4. Create Order
  const newOrder: Order = await OrderDao.createOrder({
    user_id: userId,
    total_amount: totalAmount,
    payment_status: "pending",
    order_status: "processing",
    shipping_address: user.location || {
      success: false,
      message: "Location not set in profile",
    },
    billing_address: {
      city: "New Delhi",
      state: "Delhi",
      country: "India",
    },
    payment_method: paymentMethod,
  });

  // 5. Create Order Items
  for (const item of cartItems) {
    await OrderItemDao.createOrderItem({
      order_id: newOrder.id!,
      product_id: item.product_id,
      seller_id: item.seller_id,
      quantity: item.quantity,
      price_at_purchase: Number(item.price_at_time),
    });
  }

  // 6. Clear Cart
  await CartDao.clearCartByUserId(userId);

  return res.success(newOrder, "Order placed successfully", 201);
};

/**
 * Get all orders for the authenticated user
 * GET /api/orders/my-orders
 */
export const getMyOrders = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new UnauthorizedError("Unauthorized: User not found");
  }

  const orders = await OrderDao.getOrdersByUserId(userId);
  return res.success({ orders }, "Orders fetched successfully");
};

/**
 * Get single order details
 * GET /api/orders/:id
 */
export const getOrderDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  const order = await OrderDao.getOrderById(id);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  // Security: Only the owner or an admin can see the order
  if (order.user_id !== userId && (req as any).user?.role !== "admin") {
    throw new ForbiddenError("Access denied");
  }

  const items = await OrderItemDao.getItemsByOrderId(id);
  return res.success({ ...order, items }, "Order details fetched successfully");
};

/**
 * Cancel an order
 * POST /api/orders/:id/cancel
 */
export const cancelOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  const order = await OrderDao.getOrderById(id);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.user_id !== userId) {
    throw new ForbiddenError("Access denied");
  }

  // Only allow cancellation of pending/processing orders
  if (!["pending", "processing"].includes(order.order_status)) {
    throw new BadRequestError(
      `Cannot cancel order with status: ${order.order_status}`,
    );
  }

  await OrderDao.updateOrderStatus(id, "cancelled");

  return res.success(null, "Order cancelled successfully");
};

/**
 * Get orders for seller's products
 * GET /api/orders/seller/orders
 */
export const getSellerOrders = async (req: Request, res: Response) => {
  const sellerId = (req as any).user?.id;
  if (!sellerId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const orders = await OrderDao.getOrdersBySellerId(sellerId);
  return res.success({ orders }, "Seller orders fetched successfully");
};

/**
 * Update order status (seller/admin)
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = (req as any).user;

  const validStatuses = [
    "processing",
    "confirmed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];

  if (!status || !validStatuses.includes(status)) {
    throw new BadRequestError(
      `Invalid status. Valid values: ${validStatuses.join(", ")}`,
    );
  }

  const order = await OrderDao.getOrderById(id);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  // Admin can update any order, seller can only update orders with their products
  if (user.role !== "admin") {
    const orderItems = await OrderItemDao.getItemsByOrderId(id);
    const hasSellerItems = orderItems.some(
      (item) => item.seller_id === user.id,
    );
    if (!hasSellerItems) {
      throw new ForbiddenError(
        "You can only update orders containing your products",
      );
    }
  }

  await OrderDao.updateOrderStatus(id, status);

  return res.success(null, `Order status updated to ${status}`);
};
