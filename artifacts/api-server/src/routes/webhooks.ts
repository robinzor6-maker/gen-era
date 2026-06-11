import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable } from "../lib/db.js";
import { PaymentService } from "../services/paymentService.js";
import { logger } from "../lib/logger.js";

const router = Router();

// POST /api/v1/webhooks/stripe
// This route MUST receive the raw body — it is mounted with express.raw()
// in app.ts, before the global express.json() middleware.
router.post("/stripe", async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string | undefined;

  if (!signature) {
    res.status(400).json({ success: false, message: "Missing stripe-signature header." });
    return;
  }

  let event;
  try {
    event = PaymentService.verifyWebhook(req.body as Buffer, signature);
  } catch (err: any) {
    logger.warn({ err: err.message }, "Stripe webhook signature verification failed");
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  logger.info({ type: event.type }, "Stripe webhook received");

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as { id: string; metadata: { orderId?: string } };
        const orderId = pi.metadata?.orderId;
        if (orderId) {
          await db
            .update(ordersTable)
            .set({
              paymentStatus: "paid",
              orderStatus: "processing",
              paymentRef: pi.id,
              updatedAt: new Date(),
            })
            .where(eq(ordersTable.id, orderId));
          logger.info({ orderId, piId: pi.id }, "Order marked paid");
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as { id: string; metadata: { orderId?: string } };
        const orderId = pi.metadata?.orderId;
        if (orderId) {
          await db
            .update(ordersTable)
            .set({ paymentStatus: "failed", updatedAt: new Date() })
            .where(eq(ordersTable.id, orderId));
          logger.info({ orderId }, "Order payment failed");
        }
        break;
      }

      default:
        logger.debug({ type: event.type }, "Unhandled webhook event type");
    }
  } catch (err) {
    logger.error(err, "Webhook handler error");
    res.status(500).json({ success: false, message: "Webhook processing failed." });
    return;
  }

  res.json({ received: true });
});

export default router;
