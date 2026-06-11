import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface InnerFormProps {
  accent: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

function InnerForm({ accent, onSuccess, onError }: InnerFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/checkout/complete' },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message ?? 'Payment failed. Please try again.');
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        padding: '20px',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${accent}22`,
      }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      <button
        type="submit"
        disabled={loading || !stripe}
        className="btn-fire checkout-submit-btn"
        style={{ width: '100%', padding: '18px', display: 'flex', justifyContent: 'center', gap: 10 }}
      >
        {loading ? 'PROCESSING...' : 'CONFIRM PAYMENT ⚡'}
      </button>
    </form>
  );
}

interface StripePaymentFormProps {
  clientSecret: string;
  accent?: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function StripePaymentForm({ clientSecret, accent = '#d4a853', onSuccess, onError }: StripePaymentFormProps) {
  if (!stripePromise) {
    return (
      <div style={{ padding: '20px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.8rem', letterSpacing: '0.1em', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
        STRIPE NOT CONFIGURED — ADD VITE_STRIPE_PUBLISHABLE_KEY
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: accent,
            colorBackground: '#0a0810',
            colorText: '#f0e6c8',
            colorDanger: '#ef4444',
            fontFamily: "'Cinzel', serif",
            borderRadius: '0px',
          },
        },
      }}
    >
      <InnerForm accent={accent} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
