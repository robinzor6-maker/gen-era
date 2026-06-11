import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2025-05-28.basil" });
}

export class PaymentService {
  static async createPaymentIntent(
    amountCents: number,
    currency: string,
    orderId: string,
    orderNumber: string
  ): Promise<Stripe.PaymentIntent> {
    const stripe = getStripe();
    return stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      metadata: { orderId, orderNumber },
    });
  }

  static verifyWebhook(rawBody: Buffer, signature: string): Stripe.Event {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    const stripe = getStripe();
    return stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
}
