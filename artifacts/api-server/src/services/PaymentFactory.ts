import type { PaymentProvider, SupportedProvider } from "./providers/PaymentProvider.js";
import { StripeProvider } from "./providers/StripeProvider.js";
import { PaymobProvider } from "./providers/PaymobProvider.js";

const registry: Record<SupportedProvider, () => PaymentProvider> = {
  stripe: () => new StripeProvider(),
  paymob: () => new PaymobProvider(),
};

export function getPaymentProvider(name: SupportedProvider): PaymentProvider {
  const factory = registry[name];
  if (!factory) {
    throw new Error(`Unsupported payment provider: "${name}". Supported: ${Object.keys(registry).join(", ")}`);
  }
  return factory();
}

export function getDefaultProvider(): SupportedProvider {
  const env = process.env.DEFAULT_PAYMENT_PROVIDER as SupportedProvider | undefined;
  return env ?? "stripe";
}

export type { SupportedProvider };
