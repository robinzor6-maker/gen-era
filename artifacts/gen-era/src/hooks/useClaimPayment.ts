import { useState, useCallback, useRef } from 'react';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useTempleStore } from '@/stores/templeStore';

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface PaymentState {
  loading: boolean;
  error: string | null;
  orderId: string | null;
  clientSecret: string | null;
  stripe: Stripe | null;
}

export const useClaimPayment = () => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    loading: false,
    error: null,
    orderId: null,
    clientSecret: null,
    stripe: null,
  });

  const stripeRef = useRef<Stripe | null>(null);
  const { endCeremony } = useTempleStore();
  const accessToken = localStorage.getItem('accessToken');

  const initializeStripe = useCallback(async (): Promise<Stripe | null> => {
    if (stripeRef.current) return stripeRef.current;

    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      setPaymentState((prev) => ({
        ...prev,
        error: 'Stripe configuration missing',
      }));
      return null;
    }

    try {
      const stripe = await loadStripe(publishableKey);
      if (stripe) {
        stripeRef.current = stripe;
        setPaymentState((prev) => ({ ...prev, stripe }));
      }
      return stripe;
    } catch (err) {
      setPaymentState((prev) => ({
        ...prev,
        error: 'Failed to load Stripe',
      }));
      return null;
    }
  }, []);

  const initiateClaimPayment = useCallback(
    async (product: Product): Promise<boolean> => {
      if (!accessToken) {
        setPaymentState((prev) => ({
          ...prev,
          error: 'Authentication required',
        }));
        return false;
      }

      setPaymentState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const stripe = await initializeStripe();
        if (!stripe) return false;

        const response = await fetch('/api/v1/payments/ceremony/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            amount: Math.round(product.price * 100),
            currency: 'usd',
            productId: product.id,
            metadata: {
              productName: product.name,
              productImage: product.image || '',
            },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create payment intent');
        }

        const { data } = await response.json();

        setPaymentState((prev) => ({
          ...prev,
          orderId: data.orderId,
          clientSecret: data.clientSecret,
          loading: false,
        }));

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Payment initialization failed';
        setPaymentState((prev) => ({
          ...prev,
          error: message,
          loading: false,
        }));
        return false;
      }
    },
    [accessToken, initializeStripe]
  );

  const confirmPayment = useCallback(
    async (elements: StripeElements): Promise<boolean> => {
      const { clientSecret, stripe } = paymentState;

      if (!clientSecret || !stripe) {
        setPaymentState((prev) => ({
          ...prev,
          error: 'Payment not initialized',
        }));
        return false;
      }

      setPaymentState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // SECURITY NOTE: confirmPayment handles card data securely; never directly access card details
        const result = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: window.location.origin + '/ceremony/success',
          },
          redirect: 'if_required',
        });

        if (result.error) {
          throw new Error(result.error.message || 'Payment confirmation failed');
        }

        setPaymentState((prev) => ({
          ...prev,
          loading: false,
        }));

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Payment failed';
        setPaymentState((prev) => ({
          ...prev,
          error: message,
          loading: false,
        }));

        // Gracefully rollback to phase 1 on failure
        endCeremony();
        return false;
      }
    },
    [paymentState, endCeremony]
  );

  const resetPaymentState = useCallback(() => {
    setPaymentState({
      loading: false,
      error: null,
      orderId: null,
      clientSecret: null,
      stripe: null,
    });
  }, []);

  return {
    paymentState,
    initiateClaimPayment,
    confirmPayment,
    resetPaymentState,
  };
};
