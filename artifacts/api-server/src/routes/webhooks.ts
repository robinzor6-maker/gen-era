import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable } from "../lib/db.js";
import { getPaymentProvider } from "../services/PaymentFactory.js";
import { logger } from "../lib/logger.js";

const router = Router();

async function applyWebhookResult(
  orderId: string,
  status: "paid" | "failed",
  transactionId: string,
  provider: string
) {
  if (status === "paid") {
    await db
      .update(ordersTable)
      .set({
        paymentStatus: "paid",
        orderStatus: "processing",
        paymentRef: transactionId,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, orderId));
    logger.info({ orderId, transactionId, provider }, "Order marked paid via webhook");
  } else {
    await db
      .update(ordersTable)
      .set({ paymentStatus: "failed", updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId));
    logger.info({ orderId, provider }, "Order payment failed via webhook");
  }
}

// ── POST /api/v1/webhooks/stripe ─────────────────────────────────────────────
// Receives raw body (mounted with express.raw() in app.ts before express.json()).
router.post("/stripe", async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string | undefined;

  if (!signature) {
    res.status(400).json({ success: false, message: "Missing stripe-signature header." });
    return;
  }

  let result;
  try {
    const provider = getPaymentProvider("stripe");
    result = await provider.verifyWebhook(req.body as Buffer, signature);
  } catch (err: any) {
    if (err?.code === "UNHANDLED") {
      logger.debug({ type: err.message }, "Unhandled Stripe event — acknowledged");
      res.json({ received: true });
      return;
    }
    logger.warn({ err: err.message }, "Stripe webhook verification failed");
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    await applyWebhookResult(result.orderId, result.status, result.transactionId, "stripe");
  } catch (err) {
    logger.error(err, "Stripe webhook handler error");
    res.status(500).json({ success: false, message: "Webhook processing failed." });
    return;
  }

  res.json({ received: true });
});

// ── POST /api/v1/webhooks/paymob ─────────────────────────────────────────────
// Paymob sends JSON body with HMAC in the `hmac` query param.
router.post("/paymob", async (req: Request, res: Response) => {
  const hmac = req.query["hmac"] as string | undefined;

  if (!hmac) {
    res.status(400).json({ success: false, message: "Missing hmac query parameter." });
    return;
  }

  let result;
  try {
    const provider = getPaymentProvider("paymob");
    const rawBody = JSON.stringify(req.body);
    result = await provider.verifyWebhook(rawBody, hmac);
  } catch (err: any) {
    logger.warn({ err: err.message }, "Paymob webhook verification failed");
    res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
    return;
  }

  try {
    await applyWebhookResult(result.orderId, result.status, result.transactionId, "paymob");
  } catch (err) {
    logger.error(err, "Paymob webhook handler error");
    res.status(500).json({ success: false, message: "Webhook processing failed." });
    return;
  }

  res.json({ received: true });
});

export default router;
