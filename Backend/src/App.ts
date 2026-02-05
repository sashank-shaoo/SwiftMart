import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { validateEnv } from "./config/validateEnv";
import { sanitizeInput } from "./middlewares/sanitizeMiddleware";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler";
import { responseHandler } from "./middlewares/responseHandler";
import { requestLogger } from "./middlewares/requestLogger";

import authRoutes from "./routes/auth.Routes";
import productRoutes from "./routes/product.Routes";
import inventoryRoutes from "./routes/inventory.Routes";
import orderRoutes from "./routes/order.Routes";
import cartRoutes from "./routes/cart.Routes";
import paymentRoutes from "./routes/payment.Routes";
import adminRoutes from "./routes/admin.Routes";

// Validate environment variables on startup
validateEnv();

const app = express();

// Helmet configuration
app.use(helmet());
// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Allow cookies
  }),
);

// Body parser with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Security: Input sanitization
app.use(sanitizeInput);

// Global Response Handler
app.use(responseHandler);

// Request logging
app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("SwiftMart Backend is running");
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export default app;
