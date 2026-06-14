import Stripe from "stripe";
import { db } from "../lib/db.js";
import { ordersTable } from "../lib/db.js";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { randomUUID } from "crypto";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18",
});

export interface CreatePaymentIntentInput {
  amount: number;
  currency: string;
  userId?: string;
  productId: string;
  metadata?: Record<string, string>;
}

export const createPaymentIntent = async (
  input: CreatePaymentIntentInput
): Promise<{ clientSecret: string; orderId: string }> => {
  const orderId = randomUUID();

  // IDEMPOTENCY: Generate deterministic key to prevent duplicate charges
  const idempotencyKey = `order-${orderId}`;

  try {
    // IDEMPOTENCY: Stripe uses idempotency_key for safe retries
    const intent = await stripe.paymentIntents.create(
      {
        amount: input.amount,
        currency: input.currency,
        metadata: {
          orderId,
          userId: input.userId || "guest",
          productId: input.productId,
          ...input.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      },
      {
        idempotencyKey,
      }
    );

    // Create order record in DB with pending status
    await db.insert(ordersTable).values({
      id: orderId,
      orderNumber: `ORD-${orderId.slice(0, 8).toUpperCase()}`,
      userId: input.userId,
      paymentProvider: "stripe",
      stripePaymentIntentId: intent.id,
      totalPrice: input.amount,
      paymentStatus: "unpaid",
      orderStatus: "pending",
      customerType: input.userId ? "registered" : "guest",
      customerName: "",
      customerEmail: "",
      customerAddress: "",
      customerCity: "",
    });

    logger.info(
      { orderId, amount: input.amount, currency: input.currency },
      "PaymentIntent created"
    );

    return {
      clientSecret: intent.client_secret!,
      orderId,
    };
  } catch (err) {
    logger.error({ err, orderId }, "Failed to create PaymentIntent");
    throw err;
  }
};

export const handleWebhookEvent = async (
  payload: Buffer,
  signature: string
): Promise<void> => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    logger.error({ err }, "Webhook signature verification failed");
    throw err;
  }

  logger.info({ eventType: event.type, eventId: event.id }, "Processing webhook event");

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;

        if (orderId) {
          await db
            .update(ordersTable)
            .set({ paymentStatus: "paid", orderStatus: "paid" })
            .where(eq(ordersTable.id, orderId));

          logger.info({ orderId, intentId: intent.id }, "Payment succeeded");
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;

        if (orderId) {
          await db
            .update(ordersTable)
            .set({ paymentStatus: "failed", orderStatus: "cancelled" })
            .where(eq(ordersTable.id, orderId));

          logger.warn(
            { orderId, intentId: intent.id, reason: intent.last_payment_error?.message },
            "Payment failed"
          );
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId = charge.payment_intent;

        const [order] = await db
          .select()
          .from(ordersTable)
          .where(eq(ordersTable.stripePaymentIntentId, piId as string))
          .limit(1);

        if (order) {
          await db
            .update(ordersTable)
            .set({ paymentStatus: "refunded", orderStatus: "cancelled" })
            .where(eq(ordersTable.id, order.id));

          logger.info({ orderId: order.id, chargeId: charge.id }, "Charge refunded");
        }
        break;
      }

      default:
        logger.debug({ eventType: event.type }, "Unhandled webhook event");
    }
  } catch (err) {
    logger.error({ err, eventId: event.id }, "Error processing webhook");
    throw err;
  }
};

export const getOrderStatus = async (orderId: string) => {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  return order || null;
};
