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
- **Password Hashing**: bcrypt
- **Validation**: Zod schemas
- **File Upload**: Multer + Cloudinary integration
- **Email**: Nodemailer

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
│   │   │   └── authController.ts
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
│   │   │   └── Cart.ts
│   │   ├── daos/               # Database access layer
│   │   │   ├── UserDao.ts
│   │   │   ├── SellerDao.ts
│   │   │   ├── AdminDao.ts
│   │   │   ├── ItemDao.ts
│   │   │   ├── ReviewDao.ts
│   │   │   └── CartDao.ts
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
│   ├── Server.ts
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
- quantity (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

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

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Server
PORT=5000
NODE_ENV=development
```

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
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2025-12-04T19:25:34.000Z"
  }
}
```

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

## 🔒 Security Features

- **Password Security**: Passwords are hashed using bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based authentication with 7-day expiration
- **HTTP-only Cookies**: Prevents XSS attacks by making tokens inaccessible to JavaScript
- **Input Validation**: All requests validated using Zod schemas
- **SQL Injection Protection**: Parameterized queries via PostgreSQL client
- **Role-Based Access**: Middleware enforces role-based permissions

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
