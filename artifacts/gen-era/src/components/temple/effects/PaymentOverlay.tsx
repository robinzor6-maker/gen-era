import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { useClaimPayment } from '@/hooks/useClaimPayment';
import './PaymentOverlay.css';

interface PaymentOverlayProps {
  isVisible: boolean;
  orderId: string | null;
  clientSecret: string | null;
  stripe: Stripe | null;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const PaymentFormContent: React.FC<{
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}> = ({ onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const { confirmPayment } = useClaimPayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onPaymentError('Stripe not loaded');
      return;
    }

    setProcessing(true);

    try {
      const success = await confirmPayment(elements);

      if (success) {
        onPaymentSuccess();
      } else {
        onPaymentError('Payment declined');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-element">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      <button
        type="submit"
        disabled={processing || !stripe}
        className="submit-button"
      >
        {processing ? 'Confirming Payment...' : 'Claim with Payment'}
      </button>
    </form>
  );
};

export const PaymentOverlay: React.FC<PaymentOverlayProps> = ({
  isVisible,
  orderId,
  clientSecret,
  stripe,
  onPaymentSuccess,
  onPaymentError,
}) => {
  if (!isVisible || !clientSecret || !stripe) {
    return null;
  }

  const stripeOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'dark',
      variables: {
        colorPrimary: '#d4a853',
        colorBackground: '#1a1a1a',
        colorText: '#e0d5c8',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '4px',
      },
    },
  };

  return (
    <div className="overlay">
      <div className="container">
        <div className="header">
          <h3>Confirm Your Claim</h3>
          <p className="order-id">Order {orderId?.slice(0, 8)}</p>
        </div>

        <Elements stripe={stripe} options={stripeOptions}>
          <PaymentFormContent
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
          />
        </Elements>

        <div className="footer">
          <p className="disclaimer">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentOverlay;
