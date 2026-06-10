import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useCartStore } from '@/lib/store';

function formatPrice(price: number): string {
  return price.toLocaleString('ar-EG') + ' ج.م';
}

export default function CartDrawer() {
  const {
    items,
    cartTotal,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && mounted) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, mounted]);

  if (!mounted) return null;

  return (
    <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
      <div
        className={`cart-drawer bg-temple-panel border-top-fire ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        <span className="corner-mark tl" aria-hidden="true" />
        <span className="corner-mark tr" aria-hidden="true" />
        <span className="corner-mark bl" aria-hidden="true" />
        <span className="corner-mark br" aria-hidden="true" />

        <header className="cart-drawer-header">
          <div className="cart-header-title">
            <span className="eye-glyph text-glow-gold">𓂀</span>
            <h2 className="font-display">CART ARCHIVE</h2>
          </div>
          <button
            className="cart-close-btn font-mono"
            onClick={() => setIsOpen(false)}
            aria-label="Close cart"
          >
            [CLOSE]
          </button>
        </header>

        <div className="drawer-divider" />

        <div className="cart-items-container">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <span className="empty-icon">𓋹</span>
              <p className="font-cinzel">YOUR ARTIFACT CONTAINER IS EMPTY</p>
              <p className="text-muted font-mono" style={{ fontSize: '0.75rem', marginTop: '8px' }}>
                ADD drops from the store to load them here.
              </p>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.productId} className="cart-item-card">
                  <div className="cart-item-img-wrap">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="cart-item-placeholder">𓂀</div>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <h3 className="cart-item-name font-cinzel">{item.name}</h3>
                    <span className="cart-item-price font-mono">{formatPrice(item.price)}</span>

                    <div className="cart-item-actions">
                      <div className="cart-qty-spinner">
                        <button
                          className="qty-spin-btn font-mono"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="qty-spin-value font-mono">{item.quantity}</span>
                        <button
                          className="qty-spin-btn font-mono"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="cart-remove-item font-mono"
                        onClick={() => removeFromCart(item.productId)}
                        aria-label={`Remove ${item.name}`}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <footer className="cart-drawer-footer">
            <div className="drawer-divider" />
            <div className="cart-summary-row">
              <span className="font-mono text-muted">TOTAL ACQUISITION:</span>
              <span className="cart-total-amount font-display text-glow-gold">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <Link href="/checkout">
              <button
                className="btn-fire checkout-trigger-btn"
                onClick={() => setIsOpen(false)}
              >
                CONTINUE TO CHECKOUT ⚡
              </button>
            </Link>
          </footer>
        )}
      </div>
    </div>
  );
}
