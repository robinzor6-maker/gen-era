import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, paymentsTable } from "../lib/db.js";
import { getPaymentProvider } from "../services/PaymentFactory.js";
import { logger } from "../lib/logger.js";
import { isValidOrderTransition, isValidPaymentTransition } from "../lib/orderStateMachine.js";

const router = Router();

// ── Idempotent order update via webhook ───────────────────────────────────────
// Reads the current order state first and only applies transitions that are
// valid according to the state machine. If the order is already in the target
// state (or beyond), the webhook is acknowledged without touching the DB.
async function applyWebhookResult(
  orderId: string,
  status: "paid" | "failed",
  transactionId: string,
  provider: "stripe" | "paymob",
  rawResponse?: unknown
) {
  // ── 1. Fetch current order state ──────────────────────────────────────
  const [order] = await db
    .select({
      id: ordersTable.id,
      orderStatus: ordersTable.orderStatus,
      paymentStatus: ordersTable.paymentStatus,
    })
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) {
    logger.warn({ orderId, provider }, "Webhook: order not found — skipping");
    return;
  }

  // ── 2. Check idempotency: already in target state? ────────────────────
  const targetPaymentStatus = status === "paid" ? "paid" : "failed";
  const targetOrderStatus   = status === "paid" ? "processing" : order.orderStatus;

  if (order.paymentStatus === targetPaymentStatus) {
    logger.info(
      { orderId, provider, currentStatus: order.paymentStatus },
      "Webhook: duplicate event — already in target state, skipping"
    );
    // Still insert payment log (onConflictDoNothing prevents true duplicate rows)
    await db.insert(paymentsTable).values({
      orderId,
      provider,
      status: status === "paid" ? "success" : "failed",
      amount: 0,
      transactionId,
      rawResponse: rawResponse as any ?? null,
    }).onConflictDoNothing();
    return;
  }

  // ── 3. Validate transitions via state machine ─────────────────────────
  const paymentOk = isValidPaymentTransition(order.paymentStatus, targetPaymentStatus);
  const orderOk   =
    targetOrderStatus === order.orderStatus ||
    isValidOrderTransition(order.orderStatus, targetOrderStatus);

  if (!paymentOk) {
    logger.warn(
      { orderId, provider, from: order.paymentStatus, to: targetPaymentStatus },
      "Webhook: invalid payment status transition — skipping DB update"
    );
    return;
  }

  // ── 4. Apply the update ───────────────────────────────────────────────
  const updates: Record<string, unknown> = {
    paymentStatus: targetPaymentStatus,
    updatedAt: new Date(),
  };
  if (orderOk && targetOrderStatus !== order.orderStatus) {
    updates.orderStatus = targetOrderStatus;
  }
  if (status === "paid") {
    updates.paymentRef = transactionId;
  }

  await db.update(ordersTable).set(updates).where(eq(ordersTable.id, orderId));

  logger.info(
    { orderId, transactionId, provider, paymentStatus: targetPaymentStatus },
    "Webhook: order updated"
  );

  // ── 5. Log payment event ──────────────────────────────────────────────
  await db.insert(paymentsTable).values({
    orderId,
    provider,
    status: status === "paid" ? "success" : "failed",
    amount: 0,
    transactionId,
    rawResponse: rawResponse as any ?? null,
  }).onConflictDoNothing();
}

// ── POST /api/v1/webhooks/stripe ─────────────────────────────────────────────
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

  // Always respond 200 first — Stripe will retry on timeout
  res.json({ received: true });

  // Process asynchronously after responding so Stripe doesn't time out
  applyWebhookResult(result.orderId, result.status, result.transactionId, "stripe", result)
    .catch((err) => logger.error(err, "Stripe webhook processing error"));
});

// ── POST /api/v1/webhooks/paymob ─────────────────────────────────────────────
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

  // Always respond 200 to prevent Paymob retries on our processing delay
  res.json({ received: true });

  applyWebhookResult(result.orderId, result.status, result.transactionId, "paymob", req.body)
    .catch((err) => logger.error(err, "Paymob webhook processing error"));
});

export default router;
