import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./health.js";

const app: Express = express();

// Trust the first proxy hop (Replit's reverse proxy) so rate-limiting
// and IP detection work correctly with X-Forwarded-For headers.
app.set("trust proxy", 1);

// ─── Security Headers (helmet) ────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // disabled so 3D/WebGL assets load in the previewer
    crossOriginEmbedderPolicy: false,
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: true, // reflected — tighten to specific origins in production
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Global Rate Limiting ─────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests — please try again later." },
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts — please try again later." },
});

// Strict limiter for payment endpoints — prevent payment session flooding
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many payment attempts — please try again in 10 minutes.", code: "RATE_LIMITED" },
});

// Strict limiter for order creation — prevent order flooding
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many order requests — please try again later.", code: "RATE_LIMITED" },
});

app.use(globalLimiter);
app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/payments", paymentLimiter);
app.use("/api/v1/orders", orderLimiter);

// ─── Webhook Raw Body (MUST be before express.json) ──────────────────────
// Stripe needs the raw Buffer to verify signatures.
app.use("/api/v1/webhooks/stripe", express.raw({ type: "application/json" }));

// ─── Body Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
import cookieParser from "cookie-parser";
app.use(cookieParser());

// ─── Request Logging + Request ID ─────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

// ─── Forward Request ID as response header ────────────────────────────────
app.use((req: Request, res: Response, next) => {
  res.setHeader("X-Request-ID", String(req.id));
  next();
});

// ─── Health Check Endpoint (no rate limiting) ────────────────────────────
app.use(healthRouter);

// ─── API Routes ───────────────────────────────────────────────────────────
app.use("/api", router);

// ─── 404 Handler ─────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────
app.use(errorHandler);

export default app;
