export type SupportedProvider = "stripe" | "paymob";

export interface CheckoutSession {
  provider: SupportedProvider;
  sessionId: string;
  clientSecret?: string;
  redirectUrl?: string;
  amount: number;
  currency: string;
}

export interface WebhookResult {
  orderId: string;
  status: "paid" | "failed";
  transactionId: string;
}

export interface PaymentProvider {
  readonly name: SupportedProvider;

  createCheckoutSession(params: {
    amountCents: number;
    currency: string;
    orderId: string;
    orderNumber: string;
    customerEmail?: string;
    customerName?: string;
  }): Promise<CheckoutSession>;

  verifyWebhook(rawBody: Buffer | string, signature: string): Promise<WebhookResult>;

  refundPayment(transactionId: string, amountCents: number): Promise<boolean>;
}
