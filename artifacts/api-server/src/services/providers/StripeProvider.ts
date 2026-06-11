import Stripe from "stripe";
import type { PaymentProvider, CheckoutSession, WebhookResult } from "./PaymentProvider.js";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2025-05-28.basil" });
}

export class StripeProvider implements PaymentProvider {
  readonly name = "stripe" as const;

  async createCheckoutSession(params: {
    amountCents: number;
    currency: string;
    orderId: string;
    orderNumber: string;
    customerEmail?: string;
    customerName?: string;
  }): Promise<CheckoutSession> {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: params.amountCents,
      currency: params.currency,
      metadata: { orderId: params.orderId, orderNumber: params.orderNumber },
      ...(params.customerEmail ? { receipt_email: params.customerEmail } : {}),
    });

    return {
      provider: "stripe",
      sessionId: intent.id,
      clientSecret: intent.client_secret ?? undefined,
      amount: intent.amount,
      currency: intent.currency,
    };
  }

  verifyWebhook(rawBody: Buffer, signature: string): Promise<WebhookResult> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

    let orderId: string | undefined;
    let status: "paid" | "failed" | undefined;
    let transactionId: string | undefined;

    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        orderId = pi.metadata?.orderId;
        status = "paid";
        transactionId = pi.id;
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        orderId = pi.metadata?.orderId;
        status = "failed";
        transactionId = pi.id;
        break;
      }
      default:
        throw Object.assign(new Error(`Unhandled event type: ${event.type}`), { code: "UNHANDLED" });
    }

    if (!orderId || !status || !transactionId) {
      throw new Error("Missing orderId in webhook metadata");
    }

    return Promise.resolve({ orderId, status, transactionId });
  }

  async refundPayment(transactionId: string, amountCents: number): Promise<boolean> {
    const stripe = getStripe();
    await stripe.refunds.create({ payment_intent: transactionId, amount: amountCents });
    return true;
  }
}
