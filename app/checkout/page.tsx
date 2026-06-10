'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { useAuth } from '@/lib/hooks';
import { api } from '@/lib/api';
import { OrderResponse } from '@/lib/types';

function formatPrice(price: number): string {
  return price.toLocaleString('ar-EG') + ' ج.م';
}

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCartStore();
  const { isAuthenticated, login, register } = useAuth();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  // UI / Logic States
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setError(null);

    // 1. Validation
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setValidationError('All fields except notes are required.');
      return;
    }

    if (items.length === 0) {
      setValidationError('Your cart is empty.');
      return;
    }

    setLoading(true);

    try {
      // 2. Ensure authentication (silent guest login or registration if not authenticated)
      if (!isAuthenticated) {
        const guestPassword = 'guestpassword123';
        try {
          // Attempt registering the user
          await register(fullName.trim(), email.trim().toLowerCase(), guestPassword);
        } catch (regErr) {
          // If already registered, attempt logging in with the default guest password
          try {
            await login(email.trim().toLowerCase(), guestPassword);
          } catch (loginErr) {
            throw new Error('This email is already registered. Please login or use a different email.');
          }
        }
      }

      // 3. Construct payload and send to backend
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress: {
          name: fullName.trim(),
          street: address.trim(),
          city: city.trim(),
          country: 'Egypt',
          phone: phone.trim(),
        },
      };

      const res = await api.post<OrderResponse>('/orders', payload);

      if (res.success) {
        setSuccessOrder(res.data);
        clearCart();
      } else {
        throw new Error('Failed to submit order. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Success Confirmation Screen
  if (successOrder) {
    return (
      <main className="product-detail-page success-page animate-fade-up" style={{ paddingBottom: '120px' }}>
        <header className="store-header">
          <div className="store-header-inner">
            <Link href="/" className="back-link font-mono">
              ← TEMPLE
            </Link>
            <div className="store-title-wrap">
              <span className="label store-eyebrow">GEN ERA — TRANSACTION COMPLETE</span>
              <h1 className="store-title font-display">SUCCESS</h1>
            </div>
            <div style={{ width: '40px' }} />
          </div>
        </header>

        <div className="store-empty" style={{ margin: '80px auto', maxWidth: '580px', padding: '40px', border: '1px solid var(--border-gold)', background: 'linear-gradient(135deg, rgba(8,6,18,0.95), rgba(4,3,10,0.98))', position: 'relative' }}>
          <span className="corner-mark tl" />
          <span className="corner-mark tr" />
          <span className="corner-mark bl" />
          <span className="corner-mark br" />

          <span className="empty-glyph font-display" style={{ animation: 'eyeGlow 3.5s ease-in-out infinite', color: 'var(--green-neon)', textShadow: '0 0 10px rgba(0, 255, 136, 0.3)' }}>𓋹</span>
          <h2 className="font-cinzel" style={{ color: 'var(--green-neon)', letterSpacing: '0.1em' }}>ORDER RECORDED</h2>
          
          <div className="font-mono text-muted" style={{ margin: '20px 0', fontSize: '0.85rem', lineHeight: '1.8', textAlign: 'left', borderTop: '1px solid var(--border-thin)', borderBottom: '1px solid var(--border-thin)', padding: '16px 0' }}>
            <div><strong style={{ color: 'var(--sand)' }}>ORDER ID:</strong> #{successOrder._id}</div>
            <div><strong style={{ color: 'var(--sand)' }}>ACQUISITOR:</strong> {successOrder.shippingAddress?.name}</div>
            <div><strong style={{ color: 'var(--sand)' }}>DESTINATION:</strong> {successOrder.shippingAddress?.street}, {successOrder.shippingAddress?.city}</div>
            <div><strong style={{ color: 'var(--sand)' }}>TOTAL COST:</strong> {formatPrice(successOrder.totalPrice)}</div>
            <div><strong style={{ color: 'var(--sand)' }}>STATUS:</strong> <span className="status-in-stock">{successOrder.status.toUpperCase()}</span></div>
          </div>

          <p className="text-muted font-trirong" style={{ fontSize: '0.9rem', marginBottom: '30px' }}>
            The scribes have recorded your transaction in the archive. Your artifact will be dispatched shortly.
          </p>

          <Link href="/store" className="btn-fire" style={{ padding: '12px 28px', textDecoration: 'none', display: 'inline-block' }}>
            RETURN TO ARCHIVE ⚡
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="product-detail-page checkout-route-page animate-fade-up">
      <header className="store-header">
        <div className="store-header-inner">
          <Link href="/store" className="back-link font-mono">
            ← BACK TO ARCHIVE
          </Link>
          <div className="store-title-wrap">
            <span className="label store-eyebrow">GEN ERA — ACQUISITION PROTOCOL</span>
            <h1 className="store-title font-display">CHECKOUT</h1>
          </div>
          <div style={{ width: '40px' }} />
        </div>
      </header>

      {items.length === 0 ? (
        <div className="store-empty" style={{ margin: '80px auto' }}>
          <span className="empty-glyph font-display">𓂀</span>
          <h2 className="font-cinzel">CONTAINER EMPTY</h2>
          <p className="text-muted">You have no active artifacts ready for acquisition.</p>
          <Link href="/store" className="btn-gold" style={{ marginTop: '20px', padding: '10px 20px', display: 'inline-block', textDecoration: 'none' }}>
            RETURN TO SHOP
          </Link>
        </div>
      ) : (
        <div className="detail-container checkout-grid">
          {/* Left Column — Checkout Form */}
          <div className="detail-visual-col">
            <form onSubmit={handleSubmit} className="visual-panel checkout-form-panel" style={{ padding: '30px', gap: '20px' }}>
              <span className="corner-mark tl" aria-hidden="true" />
              <span className="corner-mark tr" aria-hidden="true" />
              <span className="corner-mark bl" aria-hidden="true" />
              <span className="corner-mark br" aria-hidden="true" />

              <h2 className="font-cinzel form-title" style={{ fontSize: '1.2rem', letterSpacing: '0.15em', marginBottom: '10px', color: '#fff' }}>
                SHIPPING SPECIFICATION
              </h2>

              <div className="form-group">
                <label className="font-mono label-input">FULL NAME</label>
                <input
                  type="text"
                  className="checkout-input font-cinzel"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="font-mono label-input">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    className="checkout-input font-mono"
                    placeholder="acquisitor@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label className="font-mono label-input">PHONE NUMBER</label>
                  <input
                    type="tel"
                    className="checkout-input font-mono"
                    placeholder="01xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group" style={{ flex: '2' }}>
                  <label className="font-mono label-input">DELIVERY ADDRESS</label>
                  <input
                    type="text"
                    className="checkout-input font-cinzel"
                    placeholder="Street address, apartment, building"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label className="font-mono label-input">CITY</label>
                  <input
                    type="text"
                    className="checkout-input font-cinzel"
                    placeholder="Cairo / Alexandria"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="font-mono label-input">ORDER NOTES (OPTIONAL)</label>
                <textarea
                  className="checkout-textarea font-cinzel"
                  placeholder="Special instructions for delivery"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>

              {validationError && (
                <div className="validation-error font-mono">{validationError}</div>
              )}

              {error && (
                <div className="validation-error font-mono" style={{ borderColor: 'var(--red-live)', color: 'var(--red-live)', background: 'rgba(204,17,17,0.05)' }}>
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Right Column — Order Summary */}
          <div className="detail-info-col">
            <div className="visual-panel checkout-summary-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
              <span className="corner-mark tl" aria-hidden="true" />
              <span className="corner-mark tr" aria-hidden="true" />
              <span className="corner-mark bl" aria-hidden="true" />
              <span className="corner-mark br" aria-hidden="true" />

              <h2 className="font-cinzel form-title" style={{ fontSize: '1.2rem', letterSpacing: '0.15em', marginBottom: '20px', color: '#fff' }}>
                SUMMARY OF ACQUISITIONS
              </h2>

              <div className="checkout-summary-items" style={{ flex: '1', overflowY: 'auto', maxHeight: '280px', marginBottom: '20px' }}>
                {items.map((item) => (
                  <div key={item.productId} className="checkout-item-summary-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-thin)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="font-cinzel" style={{ fontSize: '0.85rem', color: '#fff' }}>{item.name}</span>
                      <span className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>QTY: {item.quantity} × {formatPrice(item.price)}</span>
                    </div>
                    <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--sand2)' }}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-totals" style={{ borderTop: '1px solid var(--border-gold)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }} className="font-mono text-muted">
                  <span>SUBTOTAL:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }} className="font-mono text-muted">
                  <span>DISPATCH FEE:</span>
                  <span className="status-in-stock">FREE</span>
                </div>
                <div className="info-divider" style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <span className="font-mono" style={{ color: '#fff' }}>TOTAL COST:</span>
                  <span className="font-display text-glow-gold" style={{ fontSize: '1.5rem', color: 'var(--sand2)' }}>{formatPrice(cartTotal)}</span>
                </div>

                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn-fire checkout-submit-btn"
                  style={{ width: '100%', padding: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                  disabled={loading}
                >
                  {loading ? 'PROCESSING TRANSACTION...' : 'CONFIRM ORDER ⚡'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
