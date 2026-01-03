import { Request, Response } from "express";
import { OrderDao } from "../daos/OrderDao";
import { OrderItemDao } from "../daos/OrderItemDao";
import { CartDao } from "../daos/CartDao";
import { UserDao } from "../daos/UserDao";
import { Order } from "../models/Order";

export class OrderController {
  /**
   * Process checkout and create an order
   * POST /api/orders/checkout
   */
  static async checkout(req: Request, res: Response): Promise<void> {
    try {
      // Assuming userId comes from auth middleware
      const userId = (req as any).user?.id;
      const { paymentMethod } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
        return;
      }

      if (!paymentMethod) {
        res.status(400).json({
          success: false,
          message: "Payment method is required",
        });
        return;
      }

      // 1. Get cart items
      const cartItems = await CartDao.findCartByUserId(userId);
      if (cartItems.length === 0) {
        res.status(400).json({
          success: false,
          message: "Cannot checkout with an empty cart",
        });
        return;
      }

      // 2. Get user location for default shipping address
      const user = await UserDao.findUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User profile not found",
        });
        return;
      }

      // 3. Calculate totals
      const totalAmount = cartItems.reduce(
        (acc, item) => acc + Number(item.price_at_time) * item.quantity,
        0
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

      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order: newOrder,
      });
    } catch (error: any) {
      console.error("Checkout Controller Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during checkout",
        error: error.message,
      });
    }
  }

  /**
   * Get all orders for the authenticated user
   * GET /api/orders/my-orders
   */
  static async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
        return;
      }

      const orders = await OrderDao.getOrdersByUserId(userId);
      res.status(200).json({ success: true, orders });
    } catch (error: any) {
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to fetch orders",
          error: error.message,
        });
    }
  }

  /**
   * Get single order details
   * GET /api/orders/:id
   */
  static async getOrderDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const order = await OrderDao.getOrderById(id);
      if (!order) {
        res.status(404).json({ success: false, message: "Order not found" });
        return;
      }

      // Security: Only the owner can see their order
      if (order.user_id !== userId) {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
      }

      const items = await OrderItemDao.getItemsByOrderId(id);
      res.status(200).json({ success: true, ...order, items });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch order details",
        error: error.message,
      });
    }
  }
}
