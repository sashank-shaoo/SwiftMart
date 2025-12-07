# 🛒 SwiftMart

> A full-stack e-commerce platform with robust authentication, role-based access control, and PostgreSQL + PostGIS integration

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue.svg)](https://www.postgresql.org/)
[![Next.js](https://img.shields.io/badge/Next.js-Latest-black.svg)](https://nextjs.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Backend API Documentation](#-backend-api-documentation)
- [Database Schema](#-database-schema)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [API Endpoints](#-api-endpoints)

---

## 🎯 Overview

**SwiftMart** is a modern e-commerce application built with TypeScript, featuring a RESTful API backend and a Next.js frontend. The platform supports three distinct user roles (Users, Sellers, and Admins) with secure JWT-based authentication and comprehensive data validation.

---

## 🛠️ Tech Stack

### **Backend**

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL with PostGIS extension (for geospatial data)
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies
- **Password Hashing**: bcrypt (salt rounds: 10)
- **Validation**: Zod schemas
- **File Upload**: Multer + Cloudinary integration
- **Email Service**: Nodemailer with Gmail SMTP
  - OTP-based email verification
  - Password reset functionality
  - Automatic retry logic on send failures
  - Beautiful HTML email templates

### **Frontend**

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint

### **Development Tools**

- **TypeScript Compiler**: tsc
- **Runtime**: ts-node for development
- **Version Control**: Git

---

## ✨ Features

### **Authentication & Authorization**

- ✅ Multi-role authentication (User, Seller, Admin)
- ✅ Secure JWT-based session management
- ✅ HTTP-only cookie implementation
- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ Role-based access control middleware

### **Email Verification & Security**

- ✅ **OTP-based email verification** for users and sellers
- ✅ **Password reset** with secure OTP codes
- ✅ **Email change confirmation** system
- ✅ **Automatic retry logic** for failed email sends
- ✅ **Rate limiting** (max 3 OTP requests per hour)
- ✅ **Brute force protection** (max 5 verification attempts)
- ✅ **Secure OTP storage** with bcrypt hashing
- ✅ **Auto-cleanup service** (removes used/expired OTPs)
  - Used OTPs: Deleted immediately
  - Expired OTPs: Deleted 10 minutes after expiration
- ✅ Beautiful HTML email templates with plain text fallback

### **User Management**

- ✅ User registration and login
- ✅ Seller registration and login
- ✅ Admin registration and login
- ✅ Profile verification system
- ✅ Geolocation support (PostGIS)

### **Data Validation**

- ✅ Comprehensive Zod validation schemas
- ✅ Request validation middleware
- ✅ Type-safe data models

### **Database**

- ✅ PostgreSQL with PostGIS for location data
- ✅ DAOs (Data Access Objects) for clean data layer
- ✅ Support for Users, Sellers, Admins, Items, Reviews, and Carts
- ✅ Automatic OTP cleanup with 10-minute grace period

### **File Management**

- ✅ Image upload middleware
- ✅ Cloudinary integration for asset storage

---

## 📁 Project Structure

```
ecommerce/
├── Backend/
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   ├── authController.ts
│   │   │   └── otpController.ts        # OTP verification endpoints
│   │   ├── routes/             # API route definitions
│   │   │   └── auth.Routes.ts
│   │   ├── middlewares/        # Custom middleware
│   │   │   ├── authMiddleware.ts
│   │   │   ├── validateMiddleware.ts
│   │   │   └── UploadImageMidddleware.ts
│   │   ├── models/             # TypeScript interfaces
│   │   │   ├── User.ts
│   │   │   ├── Seller.ts
│   │   │   ├── Admin.ts
│   │   │   ├── Item.ts
│   │   │   ├── Review.ts
│   │   │   ├── Cart.ts
│   │   │   └── emailOtp.ts             # OTP model
│   │   ├── daos/               # Database access layer
│   │   │   ├── UserDao.ts
│   │   │   ├── SellerDao.ts
│   │   │   ├── AdminDao.ts
│   │   │   ├── ItemDao.ts
│   │   │   ├── ReviewDao.ts
│   │   │   ├── CartDao.ts
│   │   │   └── EmailOtpDao.ts          # OTP database operations
│   │   ├── services/           # Business logic
│   │   │   ├── EmailService.ts         # Nodemailer email sending
│   │   │   └── OtpCleanupService.ts    # Auto-cleanup service
│   │   ├── utils/              # Utility functions
│   │   │   ├── otpHelpers.ts           # OTP generation
│   │   │   └── emailTemplates.ts       # HTML email templates
│   │   ├── validation(ZOD)/    # Zod validation schemas
│   │   │   ├── UserValidation.ts
│   │   │   ├── SellerValidation.ts
│   │   │   ├── AdminValidation.ts
│   │   │   ├── ItemValidation.ts
│   │   │   ├── ReviewValidation.ts
│   │   │   └── CartValidation.ts
│   │   ├── db/                 # Database connection
│   │   ├── services/           # Business logic
│   │   ├── types/              # Custom TypeScript types
│   │   ├── utils/              # Utility functions
│   │   ├── scripts/            # Database scripts
│   │   └── App.ts              # Application entry point
│   ├── Server.ts               # Server with OTP cleanup service
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
└── README.md
```

---

## 📚 Backend API Documentation

### **Architecture**

The backend follows a layered architecture pattern:

1. **Routes Layer** → Defines API endpoints
2. **Middleware Layer** → Validates requests & authenticates users
3. **Controller Layer** → Handles business logic
4. **DAO Layer** → Manages database operations
5. **Model Layer** → Defines data structures

### **Key Components**

#### **1. Authentication Controller** (`authController.ts`)

Handles all authentication-related operations with the following functions:

| Function           | Purpose                    | Security                                     |
| ------------------ | -------------------------- | -------------------------------------------- |
| `registerUser()`   | Creates new user accounts  | Password hashing, duplicate email check      |
| `loginUser()`      | Authenticates users        | bcrypt password verification, JWT generation |
| `logOutUser()`     | Terminates user sessions   | Cookie clearing                              |
| `registerSeller()` | Creates seller accounts    | Password hashing, duplicate email check      |
| `loginSeller()`    | Authenticates sellers      | bcrypt password verification, JWT generation |
| `logOutSeller()`   | Terminates seller sessions | Cookie clearing                              |
| `registerAdmin()`  | Creates admin accounts     | Password hashing, duplicate email check      |
| `loginAdmin()`     | Authenticates admins       | bcrypt password verification, JWT generation |
| `logOutAdmin()`    | Terminates admin sessions  | Cookie clearing                              |

#### **2. Data Access Objects (DAOs)**

Each DAO provides CRUD operations for its respective entity:

- **UserDao**: User database operations
- **SellerDao**: Seller database operations
- **AdminDao**: Admin database operations
- **ItemDao**: Product catalog operations
- **CartDao**: Shopping cart management
- **ReviewDao**: Product review operations
- **EmailOtpDao**: OTP creation, verification, rate limiting, and cleanup

#### **3. Validation Schemas (Zod)**

All API requests are validated using Zod schemas:

- **UserValidation**: Email, password, name, location (GeoJSON)
- **SellerValidation**: Email, password, name, location (GeoJSON)
- **AdminValidation**: Email, password, name
- **ItemValidation**: Name, price, description, category, season
- **CartValidation**: User ID, item ID, quantity
- **ReviewValidation**: User ID, item ID, rating, comment

#### **4. Middleware**

- **`authMiddleware`**: Verifies JWT tokens and protects routes
- **`validateMiddleware`**: Validates request bodies against Zod schemas
- **`UploadImageMiddleware`**: Handles file uploads with Multer

---

## 🗄️ Database Schema

### **Users Table**

```sql
- id (UUID, Primary Key)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, HASHED)
- image (VARCHAR, nullable)
- age (INTEGER, nullable)
- number (VARCHAR, nullable)
- location (GEOMETRY Point, nullable) -- PostGIS
- bio (TEXT, nullable)
- role (ENUM: 'user', 'seller', 'admin')
- is_seller_verified (BOOLEAN)
- is_admin_verified (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **Sellers Table**

```sql
- id (UUID, Primary Key)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, HASHED)
- image (VARCHAR, nullable)
- number (VARCHAR, nullable)
- location (GEOMETRY Point, nullable) -- PostGIS
- role (ENUM: 'seller', 'admin')
- is_seller_verified (BOOLEAN)
- is_admin_verified (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **Admins Table**

```sql
- id (UUID, Primary Key)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, HASHED)
- role (VARCHAR: 'admin')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **Items Table**

```sql
- id (UUID, Primary Key)
- name (VARCHAR)
- image (VARCHAR)
- price (DECIMAL)
- description (TEXT, nullable)
- category (VARCHAR, nullable)
- season (ENUM, nullable)
- seller_id (UUID, Foreign Key → sellers.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **Reviews Table**

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users.id)
- item_id (UUID, Foreign Key → items.id)
- rating (INTEGER)
- comment (TEXT, nullable)
- created_at (TIMESTAMP)
```

### **Carts Table**

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users.id)
- item_id (UUID, Foreign Key → items.id)
- seller_id (UUID, Foreign Key → sellers.id)
- quantity (INTEGER)
- price_at_time (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **Email OTPs Table**

```sql
- id (UUID, Primary Key)
- email (VARCHAR)
- account_type (ENUM: 'user', 'seller', 'admin')
- otp_hash (VARCHAR, HASHED) -- Bcrypt hashed, never plain text
- purpose (ENUM: 'email_verification', 'password_reset', 'email_change')
- expires_at (TIMESTAMPTZ) -- 5 minutes from creation
- attempts (INTEGER, default: 0) -- Max 5 attempts for brute force protection
- is_used (BOOLEAN, default: false) -- Single-use OTPs
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**Security Features:**

- OTPs are hashed with bcrypt before storage
- Automatic cleanup: Used OTPs deleted immediately, expired OTPs after 10-minute grace period
- Rate limiting: Max 3 OTP requests per hour per email
- Brute force protection: Max 5 verification attempts

---

## 🚀 Setup & Installation

### **Prerequisites**

- Node.js (LTS version)
- PostgreSQL 16+ with PostGIS extension
- Git

### **Installation Steps**

1. **Clone the repository**

   ```bash
   git clone https://github.com/sashank-shaoo/SwiftMart.git
   cd SwiftMart
   ```

2. **Backend Setup**

   ```bash
   cd Backend
   npm install
   ```

3. **Database Setup**

   - Create a PostgreSQL database
   - Enable PostGIS extension:
     ```sql
     CREATE EXTENSION postgis;
     ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swiftmart
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Gmail SMTP - Nodemailer)
MAIL_USER=your-email@gmail.com        # Gmail address
MAIL_PASS=your-app-password           # Gmail App Password (NOT regular password!)
FROM_EMAIL=noreply@swiftmart.com      # Optional: Custom sender address

# Server
PORT=5000
NODE_ENV=development
```

> **⚠️ Important**: For Gmail, you must use an **App Password**, not your regular Gmail password.  
> Generate one at: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

---

## 💻 Development

### **Backend**

```bash
cd Backend
npm run dev          # Start development server with ts-node
npm run build        # Compile TypeScript to JavaScript
```

### **Frontend**

```bash
cd frontend
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm start            # Start production server
```

---

## 🔌 API Endpoints

### **Authentication - Users**

| Method | Endpoint             | Description         | Auth Required |
| ------ | -------------------- | ------------------- | ------------- |
| POST   | `/api/auth/register` | Register a new user | ❌            |
| POST   | `/api/auth/login`    | Login user          | ❌            |
| POST   | `/api/auth/logout`   | Logout user         | ✅            |

**Example Request - User Registration:**

```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Example Response:**

```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2025-12-04T19:25:34.000Z"
  },
  "verification_sent": true
}
```

> **Note**: A verification OTP is automatically sent to the user's email upon registration.

---

### **Authentication - Sellers**

| Method | Endpoint                    | Description           | Auth Required |
| ------ | --------------------------- | --------------------- | ------------- |
| POST   | `/api/auth/seller/register` | Register a new seller | ❌            |
| POST   | `/api/auth/seller/login`    | Login seller          | ❌            |
| POST   | `/api/auth/seller/logout`   | Logout seller         | ✅            |

**Example Request - Seller Registration:**

```json
POST /api/auth/seller/register
{
  "name": "Jane's Store",
  "email": "jane@store.com",
  "password": "securePassword123",
  "location": {
    "type": "Point",
    "coordinates": [77.5946, 12.9716]
  }
}
```

---

### **Authentication - Admins**

| Method | Endpoint                   | Description          | Auth Required |
| ------ | -------------------------- | -------------------- | ------------- |
| POST   | `/api/auth/admin/register` | Register a new admin | ❌            |
| POST   | `/api/auth/admin/login`    | Login admin          | ❌            |
| POST   | `/api/auth/admin/logout`   | Logout admin         | ✅            |

---

### **Email Verification & OTP**

| Method | Endpoint                           | Description                  | Auth Required |
| ------ | ---------------------------------- | ---------------------------- | ------------- |
| POST   | `/api/auth/send-verification-otp`  | Send/resend verification OTP | ❌            |
| POST   | `/api/auth/verify-email`           | Verify email with OTP        | ❌            |
| POST   | `/api/auth/request-password-reset` | Request password reset OTP   | ❌            |
| POST   | `/api/auth/reset-password`         | Reset password with OTP      | ❌            |

**Example Request - Verify Email:**

```json
POST /api/auth/verify-email
{
  "email": "john@example.com",
  "otp": "123456",
  "account_type": "user"
}
```

**Example Response:**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Example Request - Password Reset:**

```json
POST /api/auth/request-password-reset
{
  "email": "john@example.com",
  "account_type": "user"
}

POST /api/auth/reset-password
{
  "email": "john@example.com",
  "otp": "123456",
  "new_password": "newSecurePassword123",
  "account_type": "user"
}
```

---

## 🔒 Security Features

### **Authentication & Access Control**

- **Password Security**: Passwords are hashed using bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based authentication with 7-day expiration
- **HTTP-only Cookies**: Prevents XSS attacks by making tokens inaccessible to JavaScript
- **Role-Based Access**: Middleware enforces role-based permissions

### **Email & OTP Security**

- **Secure OTP Storage**: All OTPs are hashed with bcrypt before database storage
- **Single-Use OTPs**: OTPs are marked as used after successful verification
- **Time-Limited OTPs**: OTPs expire after 5 minutes
- **Rate Limiting**: Maximum 3 OTP requests per hour per email address
- **Brute Force Protection**: Maximum 5 verification attempts per OTP
- **Automatic Cleanup**: Node.js service removes used/expired OTPs
  - Used OTPs: Deleted immediately
  - Expired OTPs: Deleted 10 minutes after expiration (grace period)
- **Email Retry Logic**: Automatic retry on email send failures

### **Data Protection**

- **Input Validation**: All requests validated using Zod schemas
- **SQL Injection Protection**: Parameterized queries via PostgreSQL client
- **CORS Protection**: Configured for secure cross-origin requests

---

## 📝 License

ISC

---

## 👨‍💻 Author

**Sashank Sahoo**

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!
