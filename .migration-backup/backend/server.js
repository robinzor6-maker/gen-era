require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const ENV_VARS = require('./config/env');

// Import routes
const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');

const app = express();

// ─── Security middleware ───────────────────────────────────────────────────
// Try to use helmet if available, fail gracefully
try {
  const helmet = require('helmet');
  app.use(helmet());
} catch (_) { /* helmet not installed yet — add to package.json */ }

// ─── CORS ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ENV_VARS.FRONTEND_URL,
  credentials: true,
}));

// ─── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Global rate limit — 100 requests / 15 min ────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Slow down.' },
});
app.use(globalLimiter);

// ─── Connect to MongoDB ───────────────────────────────────────────────────
connectDB();

// ─── Health check ─────────────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'GEN ERA API is running', env: ENV_VARS.NODE_ENV });
});

// ─── API Routes (v1) ──────────────────────────────────────────────────────
app.use('/api/v1/auth',     authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders',   orderRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// ─── Centralised error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: ENV_VARS.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Start server ─────────────────────────────────────────────────────────
const PORT = ENV_VARS.PORT;
app.listen(PORT, () => {
  console.log(`🔥 GEN ERA API running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${ENV_VARS.NODE_ENV}`);
  console.log(`🗄️  Database: ${ENV_VARS.MONGO_URI}`);
  console.log(`✅ Routes: /api/v1/auth | /api/v1/products | /api/v1/orders`);
});
