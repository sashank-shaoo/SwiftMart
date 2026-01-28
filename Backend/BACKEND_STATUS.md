# Backend Status & Documentation

## 1. Overview

The backend is a robust, production-grade E-commerce API built with **Node.js**, **Express**, and **TypeScript**. It features a modern service-oriented architecture with strict type safety, centralized error handling, and separation of concerns.

## 2. Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript (Strict mode enabled)
- **Framework**: Express.js (v5.x)
- **Database**: PostgreSQL (Primary Transactional DB)
- **Caching**: Redis (Upstash/IORedis)
- **Search**: Elasticsearch (Product Search)
- **ORM/Query**: Raw SQL with `pg` driver (DAO pattern)
- **Validation**: Zod
- **Authentication**: JWT + custom middleware (Unified Auth System)
- **Logging**: Winston
- **External Services**:
  - **Mapbox**: Location services & delivery distance calculation.
  - **Cloudinary**: Image storage.
  - **Nodemailer**: Email services (OTP/Notifications).

## 3. Architecture

The project follows a standard layered architecture:

- **Routes** (`src/routes`): Define API endpoints and apply middleware.
- **Controllers** (`src/controllers`): Handle HTTP request/response logic.
- **Services** (`src/services`): Execute business logic (e.g., `CartCacheService`, `RedisService`).
- **DAOs** (`src/daos`): Direct Database access layer (Data Access Objects).
- **Models** (`src/models`): TypeScript interfaces/types matching DB Tables.
- **Middlewares**: Interceptors for Auth, Validation, Logging, Sanitization, etc.

## 4. Database Schema (PostgreSQL)

Based on migration history (`src/scripts/migrations`):

| Table             | Purpose                                                        |
| :---------------- | :------------------------------------------------------------- |
| `users`           | Unified core user table (stores credentials, basic info).      |
| `seller_profiles` | Extension table for Seller-specific data.                      |
| `admin_profiles`  | Extension table for Admin-specific data.                       |
| `products`        | Core product catalog (Images, Description, Price, SKU).        |
| `categories`      | Hierarchical categories (supports nested structure).           |
| `inventory`       | Decoupled inventory tracking (separate from product details).  |
| `carts`           | Shopping cart items (Persistent storage).                      |
| `orders`          | Order records.                                                 |
| `order_items`     | Individual items within an order.                              |
| `wishlists`       | User saved items.                                              |
| `notifications`   | System notifications.                                          |
| `otp`             | Temporary storage for email verification codes (Auto-cleanup). |

## 5. API Documentation

### 🔐 Authentication (`/api/auth`)

_Unified Auth: Accounts can have multiple roles (User, Seller, Admin) tied to a single identity._

**Core Auth:**

- `POST /login` - Login for all user types.
- `POST /register` - Register a new customer account.
- `POST /logout` - Invalidate session/cookie.
- `POST /refresh-token` - Rotate access tokens using refresh token.

**Profile Management:**

- `POST /become-seller` - Upgrade account to Seller status.
- `PUT /update` - Update generic profile information.
- `POST /change-password` - Secure password change.
- `POST /request-email-update` & `/verify-email-update` - Two-step secure email change.

**Recovery & Verification:**

- `POST /request-password-reset` & `/reset-password` - Forgot password flow.
- `POST /send-verification-otp` & `/verify-email` - Email verification.

**Location:**

- `POST /update-location` - Save user coordinates.
- `GET /location` - Retrieve saved location.
- `POST /calculate-distance` - Delivery distance calculation (via Mapbox).

### 📦 Products (`/api/products`)

_Features ElasticSearch integration and advanced filtering._

**Discovery (Public):**

- `GET /` - List products with pagination.
- `GET /search` - Full-text search (Elasticsearch).
- `GET /:product_id` - Detailed product view.
- `GET /bestsellers`, `/top-rated`, `/new-arrivals` - Curated lists.
- `GET /season/:season`, `/category/:category_id` - Filtered lists.

**Management (Seller Only):**

- `POST /` - Create new product (supports image upload).
- `PUT /:product_id` - Update existing product.
- `DELETE /:product_id` - Soft/Hard delete product.
- `GET /seller/:seller_id` - List generic seller's catalog.

### 🛒 Cart (`/api/cart`)

_Backed by Redis caching for performance with PostgreSQL persistence._

- `GET /` - Retrieve current cart.
- `POST /` - Add item to cart.
- `PATCH /:id` - Update item quantity.
- `DELETE /:id` - Remove item.
- `DELETE /` - Clear cart.

### 🧾 Orders (`/api/orders`)

**User:**

- `POST /checkout` - Convert Cart to Order.
- `GET /my-orders` - Order history.
- `GET /:id` - Order details.
- `POST /:id/cancel` - Cancel pending order.

**Seller:**

- `GET /seller/orders` - View orders containing seller's products.
- `PATCH /:id/status` - Update fulfillment status.

### 📦 Inventory (`/api/inventory`)

_(Inferred from routes file)_

- Likely contains endpoints to adjust stock levels, check availability, and reserve stock (Decoupled from Product properties).

## 6. Recent Improvements & Fixes

- **Security**: Fixed a critical bug in `sanitizeMiddleware` to correctly handle request object properties without breaking Express internals.
- **Auth Architecture**: Completed migration to a table-per-type unified auth system (removing distinct `Sellers` table in favor of `Users` + `SellerProfiles`).
- **Performance**: Implemented `CartCacheService` to reduce DB load on frequent cart operations.
- **Reliability**: Added auto-cleanup database functions for expired OTPs.

## 7. Configuration

- **Environment**: Controlled by `.env` (Source of truth for secrets).
- **Scripts**:
  - `npm run dev`: Starts development server via `ts-node`.
  - `npm run build`: Compiles TS to JS.

## 8. Current Status Summary

The backend is in a **late-development/pre-production** state.

- **✅ Completed**: Core Auth, Product Catalog, Cart (Redis), Order Placement, Basic Search.
- **🚧 In Progress/To Review**: Advanced Inventory management, Payment Gateway integration (not seen in routes yet), Notification delivery system.
