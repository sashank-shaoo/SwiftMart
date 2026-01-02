# E-Commerce Platform - Implementation Guide
## Code Examples & Practical Setup

---

## 🚀 Quick Start: Setting Up Your Local Environment

### Prerequisites
```bash
# Install Node.js 18+
node --version  # v18.x.x or higher

# Install Docker & Docker Compose
docker --version
docker-compose --version

# Install kubectl for Kubernetes
kubectl version --client

# Clone the repository
git clone https://github.com/yourrepo/ecommerce.git
cd ecommerce
```

---

## 📦 Backend Setup (Node.js + Express)

### 1. Initialize Project Structure

```bash
mkdir ecommerce-backend
cd ecommerce-backend

npm init -y
npm install express dotenv cors helmet pg redis@4 jsonwebtoken bcryptjs stripe
npm install -D typescript @types/node @types/express nodemon ts-node

# Create folder structure
mkdir -p src/{services,controllers,models,middleware,utils,routes}
```

### 2. Environment Configuration

**`.env` file:**
```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://dev:dev123@localhost:5432/ecommerce
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_NAMESPACE=ecommerce

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_REFRESH_EXPIRY=7d

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email Service
SENDGRID_API_KEY=...

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC_ORDERS=orders
KAFKA_TOPIC_PAYMENTS=payments

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=ecommerce-products
AWS_REGION=us-east-1
```

### 3. Main Server File

**`src/server.ts`:**
```typescript
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';

dotenv.config();

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await initializeDatabase();
    // Check Redis connection
    await initializeRedis();
    res.json({ status: 'Ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'Not Ready', error: error.message });
  }
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('✓ Database connected');

    await initializeRedis();
    console.log('✓ Redis connected');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
```

### 4. Database Configuration

**`src/config/database.ts`:**
```typescript
import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DATABASE_POOL_MAX || '20'),
  min: parseInt(process.env.DATABASE_POOL_MIN || '5'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('Database connected successfully');
    client.release();
  } catch (error) {
    client.release();
    throw error;
  }
};

// Create tables on startup
export const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        address JSONB,
        role VARCHAR(20) DEFAULT 'user',
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sku VARCHAR(100) UNIQUE,
        category_id UUID,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        images JSONB,
        attributes JSONB,
        seller_id UUID,
        rating DECIMAL(3, 2),
        review_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        order_number VARCHAR(20) UNIQUE,
        status VARCHAR(50) DEFAULT 'pending',
        total_amount DECIMAL(10, 2) NOT NULL,
        tax_amount DECIMAL(10, 2),
        shipping_amount DECIMAL(10, 2),
        payment_method VARCHAR(50),
        payment_id VARCHAR(100),
        shipping_address JSONB NOT NULL,
        billing_address JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const getClient = async () => {
  return pool.connect();
};

export default pool;
```

### 5. Redis Configuration

**`src/config/redis.ts`:**
```typescript
import redis, { Redis } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: Redis;

export const initializeRedis = async () => {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  redisClient.on('connect', () => console.log('Redis Client Connected'));

  await redisClient.connect();
  return redisClient;
};

export const getRedisClient = () => redisClient;

// Helper functions
export const cache = {
  set: async (key: string, value: any, ttl: number = 3600) => {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  },
  get: async (key: string) => {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  },
  del: async (key: string) => {
    await redisClient.del(key);
  },
  flush: async () => {
    await redisClient.flushDb();
  },
};

export default redisClient;
```

### 6. Authentication Service

**`src/services/authService.ts`:**
```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { cache } from '../config/redis';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export class AuthService {
  // User registration
  static async register(email: string, password: string, firstName: string, lastName: string) {
    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, first_name, last_name, role`,
      [email, passwordHash, firstName, lastName]
    );

    return result.rows[0];
  }

  // User login
  static async login(email: string, password: string) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Cache tokens in Redis for revocation support
    await cache.set(`auth:tokens:${user.id}`, tokens.refreshToken, 7 * 24 * 3600);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      tokens,
    };
  }

  // Generate JWT tokens
  static generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRY || '15m',
      issuer: 'ecommerce-api',
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
      issuer: 'ecommerce-api',
    });

    return { accessToken, refreshToken };
  }

  // Verify token
  static verifyToken(token: string, isRefreshToken = false) {
    try {
      const secret = isRefreshToken ? process.env.JWT_REFRESH_SECRET! : process.env.JWT_SECRET!;
      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
        issuer: 'ecommerce-api',
      });
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.verifyToken(refreshToken, true) as TokenPayload;

      const newAccessToken = jwt.sign(decoded, process.env.JWT_SECRET!, {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRY || '15m',
        issuer: 'ecommerce-api',
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }
}
```

### 7. Cart Service

**`src/services/cartService.ts`:**
```typescript
import { cache } from '../config/redis';
import { query } from '../config/database';

interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
}

interface Cart {
  items: CartItem[];
  updated_at: string;
}

export class CartService {
  private static CART_KEY = (userId: string) => `cart:${userId}`;
  private static CART_TTL = 30 * 24 * 3600; // 30 days

  // Get user cart
  static async getCart(userId: string): Promise<Cart | null> {
    try {
      const cachedCart = await cache.get(this.CART_KEY(userId));
      return cachedCart;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  }

  // Add item to cart
  static async addToCart(userId: string, productId: string, quantity: number) {
    const product = await query(
      'SELECT id, price FROM products WHERE id = $1',
      [productId]
    );

    if (product.rows.length === 0) {
      throw new Error('Product not found');
    }

    const price = product.rows[0].price;
    let cart = await this.getCart(userId) || { items: [], updated_at: new Date().toISOString() };

    // Check if product already in cart
    const existingItem = cart.items.find(item => item.product_id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product_id: productId, quantity, price });
    }

    cart.updated_at = new Date().toISOString();

    // Save to cache
    await cache.set(this.CART_KEY(userId), cart, this.CART_TTL);

    return cart;
  }

  // Update item quantity
  static async updateItemQuantity(userId: string, productId: string, quantity: number) {
    let cart = await this.getCart(userId);

    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.find(i => i.product_id === productId);

    if (!item) {
      throw new Error('Item not in cart');
    }

    if (quantity <= 0) {
      // Remove item
      cart.items = cart.items.filter(i => i.product_id !== productId);
    } else {
      item.quantity = quantity;
    }

    cart.updated_at = new Date().toISOString();
    await cache.set(this.CART_KEY(userId), cart, this.CART_TTL);

    return cart;
  }

  // Remove item from cart
  static async removeFromCart(userId: string, productId: string) {
    let cart = await this.getCart(userId);

    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(item => item.product_id !== productId);
    cart.updated_at = new Date().toISOString();

    await cache.set(this.CART_KEY(userId), cart, this.CART_TTL);

    return cart;
  }

  // Clear cart
  static async clearCart(userId: string) {
    await cache.del(this.CART_KEY(userId));
  }

  // Calculate cart totals
  static calculateTotals(cart: Cart) {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    const tax = subtotal * 0.18; // 18% GST (India)
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over 500
    const total = subtotal + tax + shipping;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }
}
```

### 8. Order Service

**`src/services/orderService.ts`:**
```typescript
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { publishEvent } from '../kafka/producer';
import stripe from 'stripe';

export class OrderService {
  // Create order
  static async createOrder(
    userId: string,
    items: any[],
    shippingAddress: any,
    paymentMethodId: string
  ) {
    const client = await require('../config/database').getClient();

    try {
      await client.query('BEGIN');

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.18;
      const shipping = subtotal > 500 ? 0 : 50;
      const totalAmount = subtotal + tax + shipping;

      // Create order
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const orderResult = await client.query(
        `INSERT INTO orders (
          user_id, order_number, status, total_amount, tax_amount, 
          shipping_amount, shipping_address, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *`,
        [
          userId,
          orderNumber,
          'pending',
          totalAmount,
          tax,
          shipping,
          JSON.stringify(shippingAddress),
        ]
      );

      const order = orderResult.rows[0];

      // Add order items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.product_id, item.quantity, item.price]
        );
      }

      // Process payment
      const paymentIntent = await this.processPayment(
        order.id,
        totalAmount,
        paymentMethodId
      );

      // Update order with payment info
      await client.query(
        `UPDATE orders SET payment_id = $1, status = 'confirmed' WHERE id = $2`,
        [paymentIntent.id, order.id]
      );

      await client.query('COMMIT');

      // Publish event
      await publishEvent('OrderCreated', {
        orderId: order.id,
        userId,
        items,
        total: totalAmount,
      });

      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Process payment with Stripe
  static async processPayment(orderId: string, amount: number, paymentMethodId: string) {
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        orderId,
      },
    });

    return paymentIntent;
  }

  // Get order by ID
  static async getOrder(orderId: string, userId: string) {
    const result = await query(
      `SELECT o.*, json_agg(
        json_build_object(
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [orderId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Order not found');
    }

    return result.rows[0];
  }

  // Get user orders
  static async getUserOrders(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM orders WHERE user_id = $1`,
      [userId]
    );

    return {
      orders: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    };
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string) {
    const result = await query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      throw new Error('Order not found');
    }

    // Publish event
    await publishEvent('OrderStatusUpdated', {
      orderId,
      status,
    });

    return result.rows[0];
  }

  // Cancel order
  static async cancelOrder(orderId: string, userId: string) {
    const order = await this.getOrder(orderId, userId);

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    // Process refund if already paid
    if (order.payment_id) {
      const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);
      await stripeClient.refunds.create({
        payment_intent: order.payment_id,
      });
    }

    const result = await query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [orderId]
    );

    await publishEvent('OrderCancelled', { orderId });

    return result.rows[0];
  }
}
```

---

## 🐳 Docker Compose for Local Development

**`docker-compose.yml`:**
```yaml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 2gb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Elasticsearch
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Kafka
  zookeeper:
    image: confluentinc/cp-zookeeper:7.0.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:7.0.0
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    ports:
      - "9092:9092"
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions.sh", "--bootstrap-server", "localhost:9092"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend Service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://dev:dev123@postgres:5432/ecommerce
      REDIS_URL: redis://redis:6379
      ELASTICSEARCH_URL: http://elasticsearch:9200
      KAFKA_BROKER: kafka:9092
      JWT_SECRET: your-secret-key-dev
      JWT_REFRESH_SECRET: your-refresh-secret-dev
      STRIPE_SECRET_KEY: sk_test_...
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      kafka:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
    command: npm run dev

  # Frontend Service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3000"
    environment:
      REACT_APP_API_URL: http://localhost:3000/api
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src

volumes:
  postgres_data:
  elasticsearch_data:
```

**Development Dockerfile for Backend:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

---

## 📝 Package.json Scripts

```json
{
  "scripts": {
    "dev": "ts-node --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write 'src/**/*.ts'",
    "docker:build": "docker build -t ecommerce-backend:latest .",
    "docker:run": "docker run -p 3000:3000 --env-file .env ecommerce-backend:latest",
    "docker:compose:up": "docker-compose up -d",
    "docker:compose:down": "docker-compose down",
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js",
    "k8s:deploy": "kubectl apply -f k8s/",
    "k8s:logs": "kubectl logs -f deployment/backend-service -n production"
  }
}
```

---

## 🚀 Deploying to Kubernetes

### 1. Build and Push Docker Image

```bash
# Build image
docker build -t yourusername/ecommerce-backend:1.0.0 -f Dockerfile .

# Login to Docker Hub
docker login

# Push to registry
docker push yourusername/ecommerce-backend:1.0.0

# Tag as latest
docker tag yourusername/ecommerce-backend:1.0.0 yourusername/ecommerce-backend:latest
docker push yourusername/ecommerce-backend:latest
```

### 2. Create Kubernetes Namespace

```bash
# Create namespace
kubectl create namespace production

# Create secrets
kubectl create secret generic db-credentials \
  --from-literal=url=postgresql://user:pass@postgres:5432/ecommerce \
  -n production

kubectl create secret generic stripe-keys \
  --from-literal=secret_key=sk_live_... \
  -n production
```

### 3. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml

# Check deployment status
kubectl get deployments -n production
kubectl get pods -n production

# View logs
kubectl logs -f deployment/backend-service -n production

# Port forward for local testing
kubectl port-forward svc/backend-service 3000:80 -n production
```

---

## 📊 Monitoring & Logging

### Prometheus Metrics Scrape

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'ecommerce-backend'
    static_configs:
      - targets: ['backend-service:3000']
    metrics_path: '/metrics'
```

### Quick Testing with cURL

```bash
# Health check
curl http://localhost:3000/health

# User registration
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Get products
curl http://localhost:3000/api/products

# Add to cart
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "productId": "product-uuid",
    "quantity": 2
  }'
```

---

## 📚 Key Files to Create

1. **Middleware:**
   - `src/middleware/authMiddleware.ts` - JWT verification
   - `src/middleware/errorHandler.ts` - Global error handling
   - `src/middleware/validation.ts` - Input validation

2. **Controllers:**
   - `src/controllers/userController.ts` - User endpoints
   - `src/controllers/productController.ts` - Product endpoints
   - `src/controllers/cartController.ts` - Cart endpoints
   - `src/controllers/orderController.ts` - Order endpoints

3. **Routes:**
   - `src/routes/userRoutes.ts`
   - `src/routes/productRoutes.ts`
   - `src/routes/cartRoutes.ts`
   - `src/routes/orderRoutes.ts`

4. **Kafka:**
   - `src/kafka/producer.ts` - Publish events
   - `src/kafka/consumer.ts` - Consume events

5. **Utils:**
   - `src/utils/validators.ts` - Input validation functions
   - `src/utils/errorClasses.ts` - Custom error classes
   - `src/utils/logger.ts` - Logging utility

---

**Next Steps:**
1. Clone the repository and set up the project locally
2. Run `docker-compose up` for local development
3. Create and populate the database tables
4. Implement each microservice incrementally
5. Write tests for each service
6. Set up CI/CD pipeline
7. Deploy to Kubernetes cluster

---

**Last Updated:** December 2025
**Version:** 1.0
