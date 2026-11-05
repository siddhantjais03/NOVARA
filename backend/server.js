import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

// Error Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Prevent process crashes on network/db timeouts
process.on('uncaughtException', (err) => {
  console.warn(`[Uncaught Notice] ${err.message}`);
});
process.on('unhandledRejection', (err) => {
  console.warn(`[Unhandled Rejection] ${err?.message || err}`);
});

// Initialize Express app
const app = express();

// Trust proxy configuration for secure client IP resolution behind reverse proxies
// In production behind reverse proxy (Nginx/Cloudflare/ALB), configure TRUST_PROXY=1 in .env
let trustProxyConfig = false;
if (process.env.TRUST_PROXY === 'true') {
  trustProxyConfig = true;
} else if (process.env.TRUST_PROXY === 'false') {
  trustProxyConfig = false;
} else if (process.env.TRUST_PROXY && !isNaN(Number(process.env.TRUST_PROXY))) {
  trustProxyConfig = Number(process.env.TRUST_PROXY);
} else if (process.env.TRUST_PROXY) {
  trustProxyConfig = process.env.TRUST_PROXY;
} else if (process.env.NODE_ENV === 'production') {
  trustProxyConfig = 1;
}
app.set('trust proxy', trustProxyConfig);

// Connect to Database
connectDB();

// Explicit CORS Origin Whitelist Configuration
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
]);

// Parse configured frontend URLs from environment variables
[process.env.CLIENT_URL, process.env.FRONTEND_URL, process.env.ADDITIONAL_ALLOWED_ORIGINS].forEach((envOrigin) => {
  if (envOrigin) {
    envOrigin.split(',').forEach((url) => {
      const trimmed = url.trim();
      if (trimmed) allowedOrigins.add(trimmed);
    });
  }
});

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser agents, CLI tools, server-to-server requests without Origin header
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: Origin '${origin}' is not authorized by NOVARA security policy.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Global Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Welcome & Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'NOVARA Luxury E-Commerce API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// 404 and Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[NOVARA Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[NOVARA API] http://localhost:${PORT}/api/health`);
});

export default app;
