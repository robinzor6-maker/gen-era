import type { PaymentProvider, CheckoutSession, WebhookResult } from "./PaymentProvider.js";
import crypto from "crypto";

const PAYMOB_API_URL = "https://accept.paymob.com/api";

function getConfig() {
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = process.env.PAYMOB_INTEGRATION_ID;
  const iframeId = process.env.PAYMOB_IFRAME_ID;
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  if (!apiKey || !integrationId || !iframeId || !hmacSecret) {
    throw new Error(
      "Paymob is not configured. Required: PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_IFRAME_ID, PAYMOB_HMAC_SECRET"
    );
  }
  return { apiKey, integrationId: Number(integrationId), iframeId, hmacSecret };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${PAYMOB_API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paymob API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export class PaymobProvider implements PaymentProvider {
  readonly name = "paymob" as const;

  async createCheckoutSession(params: {
    amountCents: number;
    currency: string;
    orderId: string;
    orderNumber: string;
    customerEmail?: string;
    customerName?: string;
  }): Promise<CheckoutSession> {
    const { apiKey, integrationId, iframeId } = getConfig();

    const { token: authToken } = await post<{ token: string }>("/auth/tokens", {
      api_key: apiKey,
    });

    const { id: paymobOrderId } = await post<{ id: number }>("/ecommerce/orders", {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: params.amountCents,
      currency: params.currency.toUpperCase(),
      merchant_order_id: params.orderNumber,
      items: [],
    });

    const nameParts = (params.customerName ?? "Customer").split(" ");
    const { token: paymentKey } = await post<{ token: string }>("/acceptance/payment_keys", {
      auth_token: authToken,
      amount_cents: params.amountCents,
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: {
        apartment: "NA",
        email: params.customerEmail ?? "customer@example.com",
        floor: "NA",
        first_name: nameParts[0] ?? "Customer",
        last_name: nameParts.slice(1).join(" ") || ".",
        street: "NA",
        building: "NA",
        phone_number: "NA",
        shipping_method: "NA",
        postal_code: "NA",
        city: "Cairo",
        country: "EG",
        state: "NA",
      },
      currency: params.currency.toUpperCase(),
      integration_id: integrationId,
      lock_order_when_paid: false,
    });

    const redirectUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

    return {
      provider: "paymob",
      sessionId: paymentKey,
      redirectUrl,
      amount: params.amountCents,
      currency: params.currency,
    };
  }

  verifyWebhook(rawBody: Buffer | string, signature: string): Promise<WebhookResult> {
    const { hmacSecret } = getConfig();

    const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(body) as Record<string, unknown>;
    } catch {
      throw new Error("Invalid Paymob webhook body");
    }

    const obj = (parsed["obj"] as Record<string, unknown>) ?? {};

    const hmacFields = [
      String(obj["amount_cents"] ?? ""),
      String(obj["created_at"] ?? ""),
      String(obj["currency"] ?? ""),
      String(obj["error_occured"] ?? ""),
      String(obj["has_parent_transaction"] ?? ""),
      String(obj["id"] ?? ""),
      String(obj["integration_id"] ?? ""),
      String(obj["is_3d_secure"] ?? ""),
      String(obj["is_auth"] ?? ""),
      String(obj["is_capture"] ?? ""),
      String(obj["is_refunded"] ?? ""),
      String(obj["is_standalone_payment"] ?? ""),
      String(obj["is_voided"] ?? ""),
      String(obj["order"] ?? ""),
      String(obj["owner"] ?? ""),
      String(obj["pending"] ?? ""),
      String(obj["source_data_pan"] ?? ""),
      String(obj["source_data_sub_type"] ?? ""),
      String(obj["source_data_type"] ?? ""),
      String(obj["success"] ?? ""),
    ].join("");

    const computed = crypto.createHmac("sha512", hmacSecret).update(hmacFields).digest("hex");
    if (computed !== signature) {
      throw new Error("Paymob HMAC verification failed");
    }

    const merchantOrderId = String(
      (obj["order"] as Record<string, unknown>)?.["merchant_order_id"] ?? ""
    );
    const success = obj["success"] === true || obj["success"] === "true";
    const transactionId = String(obj["id"] ?? "");

    if (!merchantOrderId) {
      throw new Error("Missing merchant_order_id in Paymob webhook");
    }

    return Promise.resolve({
      orderId: merchantOrderId,
      status: success ? "paid" : "failed",
      transactionId,
    });
  }

  async refundPayment(transactionId: string, _amountCents: number): Promise<boolean> {
    const { apiKey } = getConfig();
    const { token: authToken } = await post<{ token: string }>("/auth/tokens", { api_key: apiKey });
    await post("/acceptance/void_refund/refund", {
      auth_token: authToken,
      transaction_id: Number(transactionId),
      amount_cents: _amountCents,
    });
    return true;
  }
}
