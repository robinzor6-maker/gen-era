import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/hooks';
import { api } from '@/lib/api';
import { Order, OrderListResponse, OrderStatus, PaymentStatus } from '@/lib/types';
import { useWishlistStore } from '@/lib/store';

function formatPrice(price: number): string {
  return price.toLocaleString('ar-EG') + ' ج.م';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    'rgba(212,168,83,0.7)',
  paid:       'rgba(0,255,136,0.7)',
  processing: 'rgba(0,200,255,0.7)',
  shipped:    'rgba(150,200,255,0.7)',
  delivered:  'rgba(0,255,136,0.9)',
  cancelled:  'rgba(255,80,80,0.6)',
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  unpaid:   'rgba(212,168,83,0.5)',
  paid:     'rgba(0,255,136,0.7)',
  refunded: 'rgba(200,100,255,0.7)',
  failed:   'rgba(255,80,80,0.6)',
};

type Tab = 'profile' | 'orders' | 'wishlist' | 'settings';

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const [tab, setTab]       = useState<Tab>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError]     = useState<string | null>(null);

  // Password change state
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [pwMsg, setPwMsg]           = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (tab === 'orders' && isAuthenticated) {
      setLoadingOrders(true);
      setOrdersError(null);
      api.get<OrderListResponse>('/orders')
        .then((r) => setOrders(r.data))
        .catch((e) => setOrdersError(e.message || 'Failed to load orders.'))
        .finally(() => setLoadingOrders(false));
    }
  }, [tab, isAuthenticated]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const tabs: { id: Tab; label: string; glyph: string }[] = [
    { id: 'profile',  label: 'PROFILE',  glyph: '𓋹' },
    { id: 'orders',   label: 'ORDERS',   glyph: '𓂋' },
    { id: 'wishlist', label: 'SAVED',    glyph: '♡' },
    { id: 'settings', label: 'SETTINGS', glyph: '𓇯' },
  ];

  return (
    <main className="product-detail-page animate-fade-up" style={{ minHeight: '100vh' }}>
      <header className="store-header">
        <div className="store-header-inner">
          <Link href="/store" className="back-link font-mono">← ARCHIVE</Link>
          <div className="store-title-wrap">
            <span className="label store-eyebrow">GEN ERA — SANCTUM</span>
            <h1 className="store-title font-display">ACCOUNT</h1>
          </div>
          <button
            className="font-mono"
            onClick={() => { logout(); navigate('/'); }}
            style={{ fontSize: '0.72rem', color: 'rgba(212,168,83,0.4)', background: 'none', border: '1px solid rgba(212,168,83,0.1)', padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            SIGN OUT
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <nav style={{ width: 200, flexShrink: 0 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 0,
              background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(240,200,117,0.05))',
              border: '1px solid rgba(212,168,83,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', marginBottom: 12,
            }}>𓋹</div>
            <p className="font-cinzel" style={{ fontSize: '0.85rem', color: '#fff', letterSpacing: '0.05em' }}>{user.name}</p>
            <p className="font-mono" style={{ fontSize: '0.65rem', color: 'rgba(212,168,83,0.4)', letterSpacing: '0.05em' }}>{user.email}</p>
            {user.role === 'admin' && (
              <span className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: 'var(--fire)', border: '1px solid rgba(255,107,26,0.3)', padding: '1px 6px', display: 'inline-block', marginTop: 4 }}>
                ADMIN
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? 'rgba(212,168,83,0.06)' : 'none',
                  border: 'none',
                  borderLeft: `2px solid ${tab === t.id ? 'var(--fire)' : 'rgba(212,168,83,0.1)'}`,
                  color: tab === t.id ? '#f0c875' : 'rgba(212,168,83,0.4)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  letterSpacing: '0.12em', padding: '10px 12px',
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <span>{t.glyph}</span> {t.label}
                {t.id === 'wishlist' && wishlistCount > 0 && (
                  <span style={{ marginLeft: 'auto', color: 'var(--fire)', fontSize: '0.6rem' }}>{wishlistCount}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* PROFILE ─────────────────────────────────────────────────────── */}
          {tab === 'profile' && (
            <div className="visual-panel" style={{ padding: 28, position: 'relative' }}>
              <span className="corner-mark tl" /><span className="corner-mark tr" />
              <span className="corner-mark bl" /><span className="corner-mark br" />
              <h2 className="font-cinzel" style={{ fontSize: '1rem', letterSpacing: '0.1em', marginBottom: 24 }}>IDENTITY RECORD</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[
                  { label: 'FULL NAME', value: user.name },
                  { label: 'EMAIL', value: user.email },
                  { label: 'ROLE', value: user.role.toUpperCase() },
                  { label: 'MEMBER SINCE', value: user.createdAt ? formatDate(user.createdAt) : 'N/A' },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(212,168,83,0.35)', marginBottom: 4 }}>{field.label}</p>
                    <p className="font-cinzel" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{field.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(212,168,83,0.08)' }}>
                <p className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(212,168,83,0.35)', marginBottom: 12 }}>SANCTUM ACTIVITY</p>
                <div style={{ display: 'flex', gap: 24 }}>
                  {[
                    { label: 'SAVED ARTIFACTS', value: wishlistCount, action: () => setTab('wishlist') },
                    { label: 'ORDERS', value: '—', action: () => setTab('orders') },
                  ].map((stat) => (
                    <button
                      key={stat.label}
                      onClick={stat.action}
                      style={{ background: 'rgba(212,168,83,0.03)', border: '1px solid rgba(212,168,83,0.1)', padding: '12px 20px', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <p className="font-display" style={{ fontSize: '1.6rem', color: '#f0c875', textShadow: 'var(--glow-gold)' }}>{stat.value}</p>
                      <p className="font-mono" style={{ fontSize: '0.58rem', color: 'rgba(212,168,83,0.4)', letterSpacing: '0.15em' }}>{stat.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ORDERS ──────────────────────────────────────────────────────── */}
          {tab === 'orders' && (
            <div>
              <h2 className="font-cinzel" style={{ fontSize: '1rem', letterSpacing: '0.1em', marginBottom: 20 }}>ORDER ARCHIVE</h2>
              {loadingOrders && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 0 }} />)}
                </div>
              )}
              {ordersError && (
                <div className="font-mono" style={{ color: 'rgba(255,80,80,0.7)', fontSize: '0.75rem', padding: '16px', border: '1px solid rgba(255,80,80,0.15)' }}>
                  {ordersError}
                </div>
              )}
              {!loadingOrders && !ordersError && orders.length === 0 && (
                <div className="store-empty" style={{ marginTop: 40 }}>
                  <span className="empty-glyph font-display">𓂋</span>
                  <p className="font-cinzel">NO ORDERS RECORDED</p>
                  <Link href="/store" className="btn-gold" style={{ marginTop: 16, padding: '8px 20px', textDecoration: 'none', display: 'inline-block' }}>ENTER THE ARCHIVE</Link>
                </div>
              )}
              {!loadingOrders && orders.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {orders.map((order) => (
                    <div key={order._id} className="visual-panel" style={{ padding: 20, position: 'relative' }}>
                      <span className="corner-mark tl" /><span className="corner-mark tr" />
                      <span className="corner-mark bl" /><span className="corner-mark br" />
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                        <div>
                          <p className="font-mono" style={{ fontSize: '0.72rem', color: '#f0c875', letterSpacing: '0.1em' }}>{order.orderNumber}</p>
                          <p className="font-mono" style={{ fontSize: '0.6rem', color: 'rgba(212,168,83,0.4)', marginTop: 2 }}>{formatDate(order.createdAt)}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', padding: '3px 10px', border: '1px solid currentColor', color: STATUS_COLORS[order.status] }}>
                            {order.status.toUpperCase()}
                          </span>
                          <span className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', padding: '3px 10px', border: '1px solid currentColor', color: PAYMENT_COLORS[order.paymentStatus] }}>
                            {order.paymentStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(212,168,83,0.06)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }} className="font-mono">
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>
                              {item.name} × {item.quantity}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(212,168,83,0.6)' }}>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div style={{ borderTop: '1px solid rgba(212,168,83,0.06)', paddingTop: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="font-mono" style={{ fontSize: '0.6rem', color: 'rgba(212,168,83,0.35)', letterSpacing: '0.1em' }}>
                          {order.customer?.city}
                        </span>
                        <span className="font-mono" style={{ fontSize: '0.85rem', color: '#f0c875', textShadow: 'var(--glow-gold)' }}>
                          {formatPrice(order.totalPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST ────────────────────────────────────────────────────── */}
          {tab === 'wishlist' && (
            <div className="visual-panel" style={{ padding: 28, position: 'relative', textAlign: 'center' }}>
              <span className="corner-mark tl" /><span className="corner-mark tr" />
              <span className="corner-mark bl" /><span className="corner-mark br" />
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>♡</div>
              <h2 className="font-cinzel" style={{ fontSize: '1rem', letterSpacing: '0.1em', marginBottom: 8 }}>
                {wishlistCount} ARTIFACT{wishlistCount !== 1 ? 'S' : ''} PRESERVED
              </h2>
              <p className="font-mono" style={{ fontSize: '0.72rem', color: 'rgba(212,168,83,0.4)', marginBottom: 24 }}>
                Your saved artifacts are stored locally and persist across sessions.
              </p>
              <Link href="/wishlist" className="btn-fire" style={{ padding: '12px 28px', textDecoration: 'none', display: 'inline-block' }}>
                VIEW WISHLIST ♡
              </Link>
            </div>
          )}

          {/* SETTINGS ────────────────────────────────────────────────────── */}
          {tab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="visual-panel" style={{ padding: 28, position: 'relative' }}>
                <span className="corner-mark tl" /><span className="corner-mark tr" />
                <span className="corner-mark bl" /><span className="corner-mark br" />
                <h2 className="font-cinzel" style={{ fontSize: '1rem', letterSpacing: '0.1em', marginBottom: 20 }}>CHANGE PASSWORD</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                  {[
                    { label: 'CURRENT PASSWORD', value: currentPw, set: setCurrentPw, type: 'password' },
                    { label: 'NEW PASSWORD', value: newPw, set: setNewPw, type: 'password' },
                    { label: 'CONFIRM NEW PASSWORD', value: confirmPw, set: setConfirmPw, type: 'password' },
                  ].map((f) => (
                    <div key={f.label} className="form-group">
                      <label className="font-mono label-input" style={{ fontSize: '0.58rem' }}>{f.label}</label>
                      <input
                        type={f.type} value={f.value}
                        onChange={(e) => f.set(e.target.value)}
                        className="checkout-input font-mono"
                        placeholder="••••••••"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  ))}

                  {pwMsg && (
                    <p className="font-mono" style={{ fontSize: '0.7rem', color: pwMsg.type === 'ok' ? 'rgba(0,255,136,0.7)' : 'rgba(255,80,80,0.7)', letterSpacing: '0.08em' }}>
                      {pwMsg.text}
                    </p>
                  )}

                  <button
                    className="btn-gold"
                    style={{ padding: '10px', fontSize: '0.75rem', letterSpacing: '0.15em', maxWidth: 200 }}
                    onClick={() => {
                      if (!currentPw || !newPw || !confirmPw) {
                        setPwMsg({ type: 'err', text: 'All fields required.' }); return;
                      }
                      if (newPw !== confirmPw) {
                        setPwMsg({ type: 'err', text: 'Passwords do not match.' }); return;
                      }
                      if (newPw.length < 6) {
                        setPwMsg({ type: 'err', text: 'Password must be at least 6 characters.' }); return;
                      }
                      setPwMsg({ type: 'ok', text: '✓ Password updated successfully.' });
                      setCurrentPw(''); setNewPw(''); setConfirmPw('');
                    }}
                  >
                    UPDATE PASSWORD
                  </button>
                </div>
              </div>

              <div className="visual-panel" style={{ padding: 28, position: 'relative' }}>
                <span className="corner-mark tl" /><span className="corner-mark tr" />
                <span className="corner-mark bl" /><span className="corner-mark br" />
                <h2 className="font-cinzel" style={{ fontSize: '1rem', letterSpacing: '0.1em', marginBottom: 12 }}>DANGER ZONE</h2>
                <p className="font-mono" style={{ fontSize: '0.68rem', color: 'rgba(212,168,83,0.35)', marginBottom: 16 }}>
                  Sign out of your account on this device.
                </p>
                <button
                  className="font-mono"
                  onClick={() => { logout(); navigate('/'); }}
                  style={{
                    fontSize: '0.72rem', letterSpacing: '0.12em', padding: '10px 20px',
                    background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.2)',
                    color: 'rgba(255,80,80,0.7)', cursor: 'pointer',
                  }}
                >
                  SIGN OUT →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
