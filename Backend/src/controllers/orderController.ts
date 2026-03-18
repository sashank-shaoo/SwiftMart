import { Request, Response } from "express";
import { OrderDao } from "../daos/OrderDao";
import { OrderItemDao } from "../daos/OrderItemDao";
import { CartDao } from "../daos/CartDao";
import { UserDao } from "../daos/UserDao";
import { InventoryDao } from "../daos/InventoryDao";
import { ProductDao } from "../daos/ProductDao";
import { TransactionDao } from "../daos/TransactionDao";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  InternalServerError,
} from "../utils/errors";

/**
 * Process unified checkout: creates orders (one per seller), processes payment, and distributes revenue
 * POST /api/orders/checkout
 */
export const checkout = async (req: Request, res: Response) => {
  const { getClient } = require("../db/db");
  const SellerProfileDao = require("../daos/SellerProfileDao").SellerProfileDao;

  const client = await getClient();

  try {
    await client.query("BEGIN");

    const userId = (req as any).user?.id;
    const { paymentMethod } = req.body;

    if (!userId) {
      throw new UnauthorizedError("Unauthorized: User not found");
    }

    if (!paymentMethod) {
      throw new BadRequestError("Payment method is required");
    }

    // 1. Validate user has location
    const user = await UserDao.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User profile not found");
    }

    if (!user.location || !user.location.coordinates) {
      throw new BadRequestError(
        "Cannot place order without delivery location. Please update your profile with your address.",
      );
    }

    // 2. Get cart items
    const cartItems = await CartDao.findCartByUserId(userId);
    if (cartItems.length === 0) {
      throw new BadRequestError("Cannot checkout with an empty cart");
    }

    // 3. Validate stock availability for ALL items before proceeding
    for (const item of cartItems) {
      const inventory = await InventoryDao.getByProductId(item.product_id);
      if (!inventory) {
        throw new BadRequestError(
          `Inventory not found for product: ${item.product_id}`,
        );
      }
      if (inventory.stock_quantity < item.quantity) {
        const product = await ProductDao.findProductById(item.product_id);
        throw new BadRequestError(
          `Insufficient stock for "${product?.name || item.product_id}". Available: ${inventory.stock_quantity}, Requested: ${item.quantity}`,
        );
      }
    }

    // 4. Group cart items by seller (for multi-seller support)
    const itemsBySeller: { [sellerId: string]: typeof cartItems } = {};
    for (const item of cartItems) {
      if (!itemsBySeller[item.seller_id]) {
        itemsBySeller[item.seller_id] = [];
      }
      itemsBySeller[item.seller_id].push(item);
    }

    const createdOrders: any[] = [];
    let totalPlatformRevenue = 0;

    // 5. Create one order per seller
    for (const [sellerId, items] of Object.entries(itemsBySeller)) {
      // Calculate order total for this seller
      const orderTotal = items.reduce(
        (acc, item) => acc + Number(item.price_at_time) * item.quantity,
        0,
      );

      const transactionId = `TX_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      // Create order with paid status immediately
      const order = await OrderDao.createOrder({
        user_id: userId,
        total_amount: orderTotal,
        payment_status: "paid",
        order_status: "processing",
        shipping_address: user.location,
        billing_address: {
          city: "New Delhi",
          state: "Delhi",
          country: "India",
        },
        payment_method: paymentMethod,
        transaction_id: transactionId,
      });

      // Create order items for this seller
      for (const item of items) {
        await OrderItemDao.createOrderItem({
          order_id: order.id!,
          product_id: item.product_id,
          seller_id: sellerId,
          quantity: item.quantity,
          price_at_purchase: Number(item.price_at_time),
        });
      }

      // Deduct stock for this seller's items
      for (const item of items) {
        const result = await InventoryDao.confirmSale(
          item.product_id,
          item.quantity,
        );
        if (!result) {
          throw new InternalServerError(
            `Failed to confirm stock for product: ${item.product_id}`,
          );
        }
      }

      // Process payment & revenue split for this seller
      const sellerProfile =
        await SellerProfileDao.findSellerProfileByUserId(sellerId);
      const commissionRate = parseFloat(
        sellerProfile?.commission_rate || "10.0",
      );
      const platformAmount = orderTotal * (commissionRate / 100);
      const sellerAmount = orderTotal - platformAmount;

      totalPlatformRevenue += platformAmount;

      // Create transaction record
      await client.query(
        `
        INSERT INTO transactions (order_id, seller_id, total_amount, seller_amount, platform_amount, commission_rate, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'completed')
      `,
        [
          order.id,
          sellerId,
          orderTotal,
          sellerAmount,
          platformAmount,
          commissionRate,
        ],
      );

      // Update seller balance
      await client.query(
        `
        UPDATE seller_profiles 
        SET total_earnings = total_earnings + $1, 
            current_balance = current_balance + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `,
        [sellerAmount, sellerId],
      );

      createdOrders.push({
        orderId: order.id,
        sellerId,
        total: orderTotal,
        sellerEarnings: sellerAmount,
        platformFee: platformAmount,
        transactionId,
      });
    }

    // 6. Update admin revenue (aggregate platform fees)
    const adminRes = await client.query(
      "SELECT user_id FROM admin_profiles LIMIT 1",
    );
    if (adminRes.rows.length > 0) {
      const adminId = adminRes.rows[0].user_id;
      await client.query(
        `
        UPDATE admin_profiles 
        SET total_revenue = total_revenue + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `,
        [totalPlatformRevenue, adminId],
      );
    }

    // 7. Clear cart
    await CartDao.clearCartByUserId(userId);

    await client.query("COMMIT");

    return res.success(
      {
        orders: createdOrders,
        totalOrders: createdOrders.length,
        totalAmount: createdOrders.reduce((acc, o) => acc + o.total, 0),
        totalPlatformRevenue,
      },
      `Checkout successful! ${createdOrders.length} order(s) created and payment processed.`,
      201,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

  // Get order items to restore stock
  const orderItems = await OrderItemDao.getItemsByOrderId(id);

  // Restore stock for each order item
  for (const item of orderItems) {
    await InventoryDao.addStock(item.product_id, item.quantity);
  }

  // Update order status to cancelled
  await OrderDao.updateOrderStatus(id, "cancelled");

  return res.success(
    null,
    "Order cancelled successfully and stock has been restored",
  );
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
 * Get seller's earnings (revenue after commission)
 * GET /api/orders/seller/earnings
 */
export const getSellerEarnings = async (req: Request, res: Response) => {
  const sellerId = (req as any).user?.id;
  if (!sellerId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const earnings = await TransactionDao.getSellerEarnings(sellerId);
  return res.success(earnings, "Seller earnings fetched successfully");
};

/**
 * Update order status (Seller Only)
 * PUT /api/orders/:orderId/status
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  const DistanceService = require("../services/DistanceService").default;
  const SellerProfileDao = require("../daos/SellerProfileDao").SellerProfileDao;

  const { id: orderId } = req.params;
  const { status } = req.body;
  const sellerId = (req as any).user?.id;
  const userRole = (req as any).user?.role;

  if (!sellerId) {
    throw new UnauthorizedError("Unauthorized");
  }

  // Sellers can only update to these statuses
  const allowedStatuses = ["processing", "cancelled", "shipped", "delivered"];

  if (!allowedStatuses.includes(status)) {
    throw new BadRequestError(
      `Invalid status. Sellers can only update to: ${allowedStatuses.join(", ")}`,
    );
  }

  // Get order
  const order = await OrderDao.findOrderById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  // Verify seller owns items in this order (unless admin)
  if (userRole !== "admin") {
    const orderItems = await OrderItemDao.getItemsByOrderId(orderId);
    const sellerOwnsOrder = orderItems.some(
      (item) => item.seller_id === sellerId,
    );

    if (!sellerOwnsOrder) {
      throw new ForbiddenError(
        "You can only update orders containing your products",
      );
    }
  }

  // Validate status transitions
  const validTransitions: { [key: string]: string[] } = {
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"], // Auto-delivered (not manually)
    delivered: [], // Terminal state
    cancelled: [], // Terminal state
  };

  const currentStatus = order.order_status;
  if (
    !validTransitions[currentStatus] ||
    !validTransitions[currentStatus].includes(status)
  ) {
    throw new BadRequestError(
      `Cannot transition from ${currentStatus} to ${status}`,
    );
  }

  // If shipping, calculate delivery time
  if (status === "shipped") {
    // Get user location from shipping address
    const userLocation = order.shipping_address;
    if (!userLocation?.coordinates) {
      throw new InternalServerError("Order missing delivery location");
    }

    // Get order items to find seller
    const orderItems = await OrderItemDao.getItemsByOrderId(orderId);
    if (orderItems.length === 0) {
      throw new InternalServerError("Order has no items");
    }

    // Get seller's warehouse location
    const sellerProfile = await SellerProfileDao.findSellerProfileByUserId(
      orderItems[0].seller_id,
    );

    if (!sellerProfile?.warehouse_location) {
      throw new BadRequestError(
        "Cannot ship order: Seller warehouse location not set. Please update your profile.",
      );
    }

    // Parse coordinates
    // warehouse_location is now a GeoJSON object from the DB (due to migration)
    let warehouseLat: number, warehouseLng: number;

    const warehouseLoc = sellerProfile.warehouse_location as any;

    if (warehouseLoc.coordinates) {
      [warehouseLng, warehouseLat] = warehouseLoc.coordinates;
    } else if (typeof warehouseLoc === "string") {
      // Legacy fallback
      const { lat, lng } = DistanceService.parseLocation(warehouseLoc);
      warehouseLat = lat;
      warehouseLng = lng;
    } else {
      throw new InternalServerError("Invalid warehouse location format");
    }

    const [userLng, userLat] = userLocation.coordinates;

    // Calculate distance
    const distanceKm = DistanceService.calculateDistance(
      warehouseLat,
      warehouseLng,
      userLat,
      userLng,
    );

    // Calculate ETA
    const estimatedDelivery =
      DistanceService.getEstimatedDeliveryDate(distanceKm);

    // Update order with shipping info
    await OrderDao.updateOrderWithShipping(orderId, {
      order_status: "shipped",
      shipped_at: new Date(),
      delivery_distance_km: distanceKm,
      estimated_delivery_time: estimatedDelivery,
    });

    return res.success(
      {
        status: "shipped",
        shippedAt: new Date(),
        distanceKm,
        estimatedDeliveryTime: estimatedDelivery,
        deliveryMinutes: DistanceService.calculateDeliveryTime(distanceKm),
      },
      "Order marked as shipped and delivery time calculated",
    );
  }

  // For other status updates (cancelled, processing)
  await OrderDao.updateOrderStatus(orderId, status);

  return res.success({ status }, "Order status updated successfully");
};
