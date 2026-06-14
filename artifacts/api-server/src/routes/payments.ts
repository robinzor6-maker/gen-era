import { Router, Request, Response } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, ordersTable, paymentsTable } from "../lib/db.js";
import { getPaymentProvider, getDefaultProvider } from "../services/PaymentFactory.js";
import type { SupportedProvider } from "../services/PaymentFactory.js";
import { getUserFromToken } from "./auth.js";
import { logger } from "../lib/logger.js";
import {
  validateBody,
  initiatePaymentSchema,
  checkoutPaymentSchema,
  createIntentSchema,
} from "../validation/index.js";

const router = Router();

const EGYPT_CITIES = [
  "cairo", "alexandria", "giza", "shubra el kheima", "port said",
  "suez", "luxor", "mansoura", "el mahalla el kubra", "tanta",
  "asyut", "ismailia", "faiyum", "zagazig", "aswan", "damietta",
  "damanhur", "minya", "beni suef", "hurghada", "qena", "sohag",
  "shibin el kom", "banha", "arish",
];

function isEgyptCity(city: string): boolean {
  const lower = city.toLowerCase().trim();
  return EGYPT_CITIES.some((c) => lower.includes(c));
}

function detectProvider(
  explicitProvider: string | undefined,
  country: string | undefined,
  customerCity: string | undefined
): SupportedProvider | "cod" {
  if (explicitProvider === "stripe" || explicitProvider === "paymob") {
    return explicitProvider;
  }
  const envDefault = getDefaultProvider();
  if (envDefault) return envDefault;
  if (country === "EG" || (customerCity && isEgyptCity(customerCity))) {
    return "paymob";
  }
  return "cod";
}

// ── Resolves and validates an order for payment ───────────────────────────────
// Returns null and writes the error response if the order is invalid.
async function resolveOrder(orderId: string, req: Request, res: Response) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) {
    res.status(404).json({ success: false, message: "Order not found." });
    return null;
  }
  if (order.paymentStatus === "paid") {
    res.status(409).json({ success: false, message: "Order is already paid." });
    return null;
  }

  const authUser = await getUserFromToken(req);
  if (order.userId && (!authUser || authUser.id !== order.userId)) {
    res.status(403).json({ success: false, message: "Not authorized to pay for this order." });
    return null;
  }
  return order;
}

// ── Idempotency guard — block concurrent/duplicate payment attempts ───────────
// Returns an existing in-progress payment if one was created in the last 30 min.
async function findActivePayment(orderId: string) {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);
  const [active] = await db
    .select()
    .from(paymentsTable)
    .where(
      and(
        eq(paymentsTable.orderId, orderId),
        inArray(paymentsTable.status, ["initiated", "success"]),
        // createdAt >= cutoff — drizzle doesn't expose gte on timestamps directly
        // so we do a raw comparison via JS-side filter on the returned row
      )
    )
    .orderBy(desc(paymentsTable.createdAt))
    .limit(1);

  if (!active) return null;
  if (active.createdAt && active.createdAt < cutoff) return null;
  return active;
}

// ── POST /api/v1/payments/initiate ───────────────────────────────────────────
router.post(
  "/initiate",
  validateBody(initiatePaymentSchema),
  async (req: Request, res: Response) => {
    const { orderId, provider: reqProvider, country } = req.body;

    const order = await resolveOrder(orderId, req, res);
    if (!order) return;

    // ── Idempotency: block duplicate in-flight payment attempts ──────────
    const activePayment = await findActivePayment(orderId);
    if (activePayment && activePayment.status === "success") {
      logger.info({ orderId }, "Duplicate payment/initiate — order already paid");
      return res.status(409).json({ success: false, message: "Order is already paid." });
    }
    if (activePayment && activePayment.status === "initiated") {
      logger.info({ orderId, paymentId: activePayment.id }, "Duplicate payment/initiate — returning existing session");
      return res.status(409).json({
        success: false,
        message: "A payment is already in progress for this order. Please complete or wait 30 minutes before retrying.",
        code: "PAYMENT_IN_PROGRESS",
      });
    }

    const chosen = detectProvider(reqProvider, country, order.customerCity ?? undefined);

    if (chosen === "cod") {
      logger.info({ orderId }, "Payment initiated as COD (no provider configured)");
      await db.insert(paymentsTable).values({
        orderId: order.id,
        provider: "cod" as any,
        status: "success",
        amount: order.totalPrice,
        transactionId: null,
      }).onConflictDoNothing();
      await db
        .update(ordersTable)
        .set({ paymentProvider: "cod" as any, paymentStatus: "paid", orderStatus: "processing", updatedAt: new Date() })
        .where(eq(ordersTable.id, order.id));
      return res.json({
        success: true,
        data: { provider: "cod", orderId, orderNumber: order.orderNumber },
      });
    }

    try {
      const provider = getPaymentProvider(chosen);
      const currency = (order as any).currency ?? (chosen === "paymob" ? "egp" : "usd");

      const session = await provider.createCheckoutSession({
        amountCents: order.totalPrice,
        currency,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
      });

      await db
        .update(ordersTable)
        .set({
          paymentProvider: chosen,
          stripePaymentIntentId:
            chosen === "stripe" ? session.sessionId : order.stripePaymentIntentId,
          updatedAt: new Date(),
        })
        .where(eq(ordersTable.id, order.id));

      await db.insert(paymentsTable).values({
        orderId: order.id,
        provider: chosen,
        status: "initiated",
        amount: order.totalPrice,
        transactionId: session.sessionId ?? null,
      });

      logger.info(
        { orderId, provider: chosen, sessionId: session.sessionId },
        "Payment initiated"
      );

      return res.json({
        success: true,
        data: {
          provider: chosen,
          orderId,
          orderNumber: order.orderNumber,
          clientSecret: session.clientSecret,
          redirectUrl: session.redirectUrl,
          amount: session.amount,
          currency: session.currency,
        },
      });
    } catch (err: any) {
      const isConfigError =
        err?.message?.includes("is not configured") ||
        err?.message?.includes("is not set") ||
        err?.message?.includes("STRIPE_SECRET_KEY") ||
        err?.message?.includes("PAYMOB_API_KEY");

      if (isConfigError) {
        logger.warn({ provider: chosen }, "Provider not configured — falling back to COD");
        // COD fallback — log the attempt and return success
        await db.insert(paymentsTable).values({
          orderId: order.id,
          provider: "cod" as any,
          status: "success",
          amount: order.totalPrice,
          transactionId: null,
        }).onConflictDoNothing();
        await db
          .update(ordersTable)
          .set({ paymentProvider: "cod" as any, paymentStatus: "paid", orderStatus: "processing", updatedAt: new Date() })
          .where(eq(ordersTable.id, order.id));
        return res.json({
          success: true,
          data: { provider: "cod", orderId, orderNumber: order.orderNumber },
        });
      }

      logger.error({ orderId, provider: chosen, err: err?.message }, "Payment initiation failed");
      await db.insert(paymentsTable).values({
        orderId: order.id,
        provider: chosen,
        status: "failed",
        amount: order.totalPrice,
        transactionId: null,
        rawResponse: { error: err?.message } as any,
      }).onConflictDoNothing();

      return res.status(502).json({
        success: false,
        message: "Payment provider error. Please try again.",
        code: "PROVIDER_ERROR",
      });
    }
  }
);

// ── POST /api/v1/payments/checkout ──────────────────────────────────────────
router.post(
  "/checkout",
  validateBody(checkoutPaymentSchema),
  async (req: Request, res: Response) => {
    const { orderId, provider: reqProvider } = req.body;
    const providerName: SupportedProvider = reqProvider ?? getDefaultProvider();

    const order = await resolveOrder(orderId, req, res);
    if (!order) return;

    const activePayment = await findActivePayment(orderId);
    if (activePayment) {
      return res.status(409).json({
        success: false,
        message: "A payment session is already active for this order.",
        code: "PAYMENT_IN_PROGRESS",
      });
    }

    try {
      const provider = getPaymentProvider(providerName);
      const currency = (order as any).currency ?? "usd";

      const session = await provider.createCheckoutSession({
        amountCents: order.totalPrice,
        currency,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
      });

      await db
        .update(ordersTable)
        .set({
          paymentProvider: providerName,
          stripePaymentIntentId:
            providerName === "stripe" ? session.sessionId : order.stripePaymentIntentId,
          updatedAt: new Date(),
        })
        .where(eq(ordersTable.id, order.id));

      await db.insert(paymentsTable).values({
        orderId: order.id,
        provider: providerName,
        status: "initiated",
        amount: order.totalPrice,
        transactionId: session.sessionId ?? null,
      });

      return res.json({ success: true, data: session });
    } catch (err: any) {
      const isConfigError =
        err?.message?.includes("is not configured") || err?.message?.includes("is not set");
      if (isConfigError) {
        return res.status(503).json({
          success: false,
          message: `Payment provider "${providerName}" is not configured.`,
          code: "PROVIDER_NOT_CONFIGURED",
        });
      }
      logger.error({ orderId, provider: providerName, err: err?.message }, "Checkout failed");
      return res.status(502).json({
        success: false,
        message: "Payment provider error.",
        code: "PROVIDER_ERROR",
      });
    }
  }
);

// ── POST /api/v1/payments/create-intent ─────────────────────────────────────
router.post(
  "/create-intent",
  validateBody(createIntentSchema),
  async (req: Request, res: Response) => {
    const { orderId } = req.body;
    const order = await resolveOrder(orderId, req, res);
    if (!order) return;

    try {
      const provider = getPaymentProvider("stripe");
      const currency = (order as any).currency ?? "usd";

      const session = await provider.createCheckoutSession({
        amountCents: order.totalPrice,
        currency,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
      });

      await db
        .update(ordersTable)
        .set({
          paymentProvider: "stripe",
          stripePaymentIntentId: session.sessionId,
          updatedAt: new Date(),
        })
        .where(eq(ordersTable.id, order.id));

      return res.json({
        success: true,
        data: {
          clientSecret: session.clientSecret,
          paymentIntentId: session.sessionId,
          amount: session.amount,
          currency: session.currency,
        },
      });
    } catch (err: any) {
      const isConfigError =
        err?.message?.includes("STRIPE_SECRET_KEY") || err?.message?.includes("is not configured");
      if (isConfigError) {
        return res.status(503).json({
          success: false,
          message: "Payment service is not configured.",
          code: "PROVIDER_NOT_CONFIGURED",
        });
      }
      logger.error({ orderId, err: err?.message }, "create-intent failed");
      return res.status(502).json({
        success: false,
        message: "Stripe error. Please try again.",
        code: "PROVIDER_ERROR",
      });
    }
  }
);

// ── Stripe Ceremony Payment Routes ──────────────────────────────────────────

import express from "express";
import { z } from "zod/v4";
import {
  createPaymentIntent,
  handleWebhookEvent,
  getOrderStatus,
} from "../services/stripe.js";
import { verifyToken } from "../middleware/auth.js";

// ── POST /api/v1/payments/ceremony/create-intent ────────────────────────────
// Create PaymentIntent for Claim Ceremony
const ceremonyIntentSchema = z.object({
  amount: z.number().int().min(1, "Amount must be at least 1 cent"),
  currency: z.string().toLowerCase().default("usd"),
  productId: z.string().min(1),
  metadata: z.record(z.string()).optional(),
});

router.post(
  "/ceremony/create-intent",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const data = ceremonyIntentSchema.parse(req.body);

      const result = await createPaymentIntent({
        amount: data.amount,
        currency: data.currency,
        userId: req.user?.userId,
        productId: data.productId,
        metadata: data.metadata,
      });

      res.json({
        success: true,
        data: {
          clientSecret: result.clientSecret,
          orderId: result.orderId,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: err.errors[0].message });
      } else {
        logger.error({ err }, "Failed to create ceremony payment intent");
        res.status(500).json({ success: false, message: "Failed to create payment intent" });
      }
    }
  }
);

// ── POST /api/v1/payments/webhook ───────────────────────────────────────────
// SECURITY NOTE: This endpoint is NOT protected by JWT; uses Stripe signature verification instead
router.post("/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response): Promise<void> => {
  try {
    const sig = req.headers["stripe-signature"];

    if (typeof sig !== "string") {
      res.status(400).json({ success: false, message: "Missing stripe-signature header" });
      return;
    }

    await handleWebhookEvent(req.body, sig);

    res.json({ success: true, received: true });
  } catch (err) {
    logger.error({ err }, "Webhook handler error");
    res.status(400).json({ success: false, message: "Webhook error" });
  }
});

// ── GET /api/v1/payments/order/:id ──────────────────────────────────────────
// SECURITY NOTE: Protected endpoint; users can only view their own orders
router.get("/order/:id", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await getOrderStatus(id);

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // SECURITY NOTE: Ensure user can only access their own orders
    if (order.userId && order.userId !== req.user?.userId) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    res.json({
      success: true,
      data: {
        id: order.id,
        paymentStatus: order.paymentStatus,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    logger.error({ err }, "Failed to get order status");
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
