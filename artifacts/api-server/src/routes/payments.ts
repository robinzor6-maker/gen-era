import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable } from "../lib/db.js";
import { getPaymentProvider, getDefaultProvider } from "../services/PaymentFactory.js";
import type { SupportedProvider } from "../services/PaymentFactory.js";
import { getUserFromToken } from "./auth.js";

const router = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveOrder(orderId: string, req: Request, res: Response) {
  if (!orderId) {
    res.status(400).json({ success: false, message: "orderId is required." });
    return null;
  }

  if (!UUID_RE.test(orderId)) {
    res.status(400).json({ success: false, message: "orderId must be a valid UUID." });
    return null;
  }

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

// ── POST /api/v1/payments/checkout ──────────────────────────────────────────
// Provider-agnostic checkout. Defaults to DEFAULT_PAYMENT_PROVIDER env var.
// Body: { orderId: string, provider?: "stripe" | "paymob" }
router.post("/checkout", async (req: Request, res: Response) => {
  const { orderId, provider: reqProvider } = req.body;
  const providerName: SupportedProvider = reqProvider ?? getDefaultProvider();

  const order = await resolveOrder(orderId, req, res);
  if (!order) return;

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
        stripePaymentIntentId: providerName === "stripe" ? session.sessionId : order.stripePaymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, order.id));

    res.json({ success: true, data: session });
  } catch (err: any) {
    if (err?.message?.includes("is not configured") || err?.message?.includes("is not set")) {
      res.status(503).json({ success: false, message: `Payment provider "${providerName}" is not configured.` });
    } else {
      throw err;
    }
  }
});

// ── POST /api/v1/payments/create-intent ─────────────────────────────────────
// Legacy Stripe-only endpoint — kept for backward compatibility with the frontend.
// Delegates to /checkout with provider=stripe.
router.post("/create-intent", async (req: Request, res: Response) => {
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

    res.json({
      success: true,
      data: {
        clientSecret: session.clientSecret,
        paymentIntentId: session.sessionId,
        amount: session.amount,
        currency: session.currency,
      },
    });
  } catch (err: any) {
    if (err?.message?.includes("STRIPE_SECRET_KEY") || err?.message?.includes("is not configured")) {
      res.status(503).json({ success: false, message: "Payment service is not configured." });
    } else {
      throw err;
    }
  }
});

export default router;
