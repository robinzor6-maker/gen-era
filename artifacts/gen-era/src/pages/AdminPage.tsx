import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'wouter';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/hooks';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Stats {
  products: number;
  orders: number;
  users: number;
  revenue: number;
  recentOrders: OrderRow[];
}

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  totalPrice: number;
  orderStatus: string;
  paymentStatus: string;
  paymentProvider: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  sku: string;
}

interface PaymentAttempt {
  id: string;
  provider: string;
  status: string;
  amount: number;
  transactionId?: string;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: any;
  after?: any;
  ip?: string;
  createdAt: string;
}

interface OrderDetail extends OrderRow {
  items: OrderItem[];
  payments: PaymentAttempt[];
  auditLog: AuditEntry[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  category: string;
  image: string;
  slug: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Filters {
  search: string;
  status: string;
  paymentStatus: string;
  provider: string;
  from: string;
  to: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ORDER_STATUSES    = ['', 'pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES  = ['', 'unpaid', 'paid', 'failed', 'refunded'];
const PROVIDERS         = ['', 'stripe', 'paymob', 'cod'];

const ALLOWED_ORDER_NEXT: Record<string, string[]> = {
  pending:    ['processing', 'paid', 'cancelled'],
  processing: ['paid', 'shipped', 'cancelled'],
  paid:       ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
};
const ALLOWED_PAYMENT_NEXT: Record<string, string[]> = {
  unpaid:   ['paid', 'failed'],
  failed:   ['paid'],
  paid:     ['refunded'],
  refunded: [],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function statusColor(s: string) {
  if (s === 'paid' || s === 'delivered' || s === 'success') return '#4ade80';
  if (s === 'shipped' || s === 'processing' || s === 'initiated') return '#60a5fa';
  if (s === 'cancelled' || s === 'failed') return '#f87171';
  if (s === 'refunded') return '#a78bfa';
  return '#d4a853';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ text }: { text: string }) {
  const color = statusColor(text);
  return (
    <span style={{ background: `${color}18`, color, border: `1px solid ${color}40`, borderRadius: 12, padding: '2px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
      {text || '—'}
    </span>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%)', border: '1px solid #2a2a3e', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ fontSize: 32 }}>{icon}</span>
      <div>
        <div style={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
        <div style={{ color: '#f0c875', fontSize: 22, fontWeight: 700, fontFamily: 'Cinzel, serif' }}>{value}</div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: '#d4a853' }}>
      <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #2a2a3e', borderTopColor: '#d4a853', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ marginTop: 12, fontSize: 13, color: '#666', fontFamily: 'monospace', letterSpacing: 1 }}>LOADING...</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: '#444' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>𓂀</div>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15 }}>{message}</div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={{ color: '#f87171', background: '#1a0a0a', border: '1px solid #f8717133', padding: '14px 18px', borderRadius: 8, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>⚠ {message}</span>
      {onRetry && <button onClick={onRetry} style={{ ...smallBtn, borderColor: '#f87171', color: '#f87171' }}>Retry</button>}
    </div>
  );
}

// ── Order Detail Panel ────────────────────────────────────────────────────────

function OrderDetailPanel({ orderId, onClose, onStatusUpdated }: {
  orderId: string;
  onClose: () => void;
  onStatusUpdated: (id: string, orderStatus: string, paymentStatus: string) => void;
}) {
  const [detail,  setDetail]  = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await api.get<{ success: boolean; data: OrderDetail }>(`/admin/orders/${orderId}`);
      setDetail(r.data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  async function applyStatus(orderStatus: string, paymentStatus: string) {
    if (!detail) return;
    setSaving(true); setStatusMsg(null);
    try {
      const body: any = {};
      if (orderStatus   !== detail.orderStatus)   body.orderStatus   = orderStatus;
      if (paymentStatus !== detail.paymentStatus) body.paymentStatus = paymentStatus;
      if (!Object.keys(body).length) { setSaving(false); return; }
      await api.patch(`/admin/orders/${orderId}/status`, body);
      setDetail(prev => prev ? { ...prev, orderStatus, paymentStatus } : prev);
      onStatusUpdated(orderId, orderStatus, paymentStatus);
      setStatusMsg({ type: 'ok', text: 'Status updated.' });
    } catch (e: any) {
      const msg = e.message ?? 'Failed to update status.';
      setStatusMsg({ type: 'err', text: msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)' }} />

      {/* Panel */}
      <div style={{ width: '100%', maxWidth: 680, background: '#090916', borderLeft: '1px solid #2a2a3e', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #2a2a3e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d0d1a', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: '#666', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 4 }}>ORDER DETAIL</div>
            <div style={{ fontFamily: 'Cinzel, serif', color: '#f0c875', fontSize: 18, letterSpacing: 1 }}>{detail?.orderNumber ?? '…'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #2a2a3e', color: '#888', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>✕ Close</button>
        </div>

        {loading && <Spinner />}
        {error   && <div style={{ padding: 28 }}><ErrorBanner message={error} onRetry={load} /></div>}

        {detail && !loading && (
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Status message */}
            {statusMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 6, background: statusMsg.type === 'ok' ? '#0a1a0a' : '#1a0a0a', border: `1px solid ${statusMsg.type === 'ok' ? '#4ade8044' : '#f8717144'}`, color: statusMsg.type === 'ok' ? '#4ade80' : '#f87171', fontSize: 13 }}>
                {statusMsg.type === 'ok' ? '✓' : '⚠'} {statusMsg.text}
              </div>
            )}

            {/* Status control */}
            <section>
              <SectionTitle>Status Control</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>ORDER STATUS</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                    {['pending','processing','paid','shipped','delivered','cancelled'].map(s => {
                      const allowed = ALLOWED_ORDER_NEXT[detail.orderStatus] ?? [];
                      const isCurrent = s === detail.orderStatus;
                      const isAllowed = allowed.includes(s);
                      return (
                        <button
                          key={s}
                          disabled={saving || isCurrent || !isAllowed}
                          onClick={() => applyStatus(s, detail.paymentStatus)}
                          style={{
                            background: isCurrent ? `${statusColor(s)}22` : 'transparent',
                            border: `1px solid ${isCurrent ? statusColor(s) : isAllowed ? '#3a3a5e' : '#222'}`,
                            color: isCurrent ? statusColor(s) : isAllowed ? '#aaa' : '#333',
                            borderRadius: 6,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: isCurrent || !isAllowed ? 'not-allowed' : 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {isCurrent ? '● ' : ''}{s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>PAYMENT STATUS</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                    {['unpaid','paid','failed','refunded'].map(s => {
                      const allowed = ALLOWED_PAYMENT_NEXT[detail.paymentStatus] ?? [];
                      const isCurrent = s === detail.paymentStatus;
                      const isAllowed = allowed.includes(s);
                      return (
                        <button
                          key={s}
                          disabled={saving || isCurrent || !isAllowed}
                          onClick={() => applyStatus(detail.orderStatus, s)}
                          style={{
                            background: isCurrent ? `${statusColor(s)}22` : 'transparent',
                            border: `1px solid ${isCurrent ? statusColor(s) : isAllowed ? '#3a3a5e' : '#222'}`,
                            color: isCurrent ? statusColor(s) : isAllowed ? '#aaa' : '#333',
                            borderRadius: 6,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: isCurrent || !isAllowed ? 'not-allowed' : 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {isCurrent ? '● ' : ''}{s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Customer info */}
            <section>
              <SectionTitle>Customer Information</SectionTitle>
              <div style={{ background: '#0d0d1a', border: '1px solid #2a2a3e', borderRadius: 8, padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                <InfoRow label="Name"    value={detail.customerName} />
                <InfoRow label="Email"   value={detail.customerEmail} />
                <InfoRow label="Phone"   value={detail.customerPhone || '—'} />
                <InfoRow label="City"    value={detail.customerCity} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <InfoRow label="Address" value={detail.customerAddress} />
                </div>
                {detail.notes && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <InfoRow label="Notes" value={detail.notes} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                <KV label="Total"    value={fmtPrice(detail.totalPrice)} color="#f0c875" />
                <KV label="Provider" value={detail.paymentProvider ?? 'none'} />
                <KV label="Created"  value={fmtDateTime(detail.createdAt)} />
              </div>
            </section>

            {/* Items */}
            <section>
              <SectionTitle>Order Items ({detail.items.length})</SectionTitle>
              <table style={{ ...tableStyle, width: '100%' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                    {['Product', 'SKU', 'Qty', 'Price', 'Subtotal'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #1a1a2e' }}>
                      <td style={tdStyle}>
                        <div style={{ color: '#e8e8e8', fontWeight: 500 }}>{item.name}</div>
                        {(item.selectedSize || item.selectedColor) && (
                          <div style={{ color: '#666', fontSize: 11 }}>
                            {[item.selectedSize, item.selectedColor].filter(Boolean).join(' · ')}
                          </div>
                        )}
                      </td>
                      <td style={{ ...tdStyle, color: '#555', fontFamily: 'monospace', fontSize: 11 }}>{item.sku}</td>
                      <td style={tdStyle}>{item.quantity}</td>
                      <td style={tdStyle}>{fmtPrice(item.price)}</td>
                      <td style={{ ...tdStyle, color: '#f0c875', fontWeight: 600 }}>{fmtPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} style={{ ...tdStyle, textAlign: 'right', color: '#888', fontFamily: 'monospace', fontSize: 12 }}>TOTAL</td>
                    <td style={{ ...tdStyle, color: '#f0c875', fontWeight: 700, fontSize: 15 }}>{fmtPrice(detail.totalPrice)}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Payment attempts timeline */}
            <section>
              <SectionTitle>Payment Attempts ({detail.payments.length})</SectionTitle>
              {detail.payments.length === 0
                ? <EmptyState message="No payment attempts recorded" />
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {detail.payments.map((p, i) => (
                      <div key={p.id} style={{ background: '#0d0d1a', border: '1px solid #2a2a3e', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(p.status), flexShrink: 0 }} />
                          {i < detail.payments.length - 1 && <div style={{ width: 1, height: 20, background: '#2a2a3e' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ color: '#e8e8e8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>{p.provider}</span>
                              <Badge text={p.status} />
                            </div>
                            <span style={{ color: '#555', fontSize: 11, fontFamily: 'monospace' }}>{fmtDateTime(p.createdAt)}</span>
                          </div>
                          {p.amount > 0 && <div style={{ color: '#888', fontSize: 12 }}>Amount: {fmtPrice(p.amount)}</div>}
                          {p.transactionId && <div style={{ color: '#555', fontSize: 11, fontFamily: 'monospace', marginTop: 2, wordBreak: 'break-all' }}>TXN: {p.transactionId}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </section>

            {/* Audit log */}
            <section>
              <SectionTitle>Audit Log ({detail.auditLog.length})</SectionTitle>
              {detail.auditLog.length === 0
                ? <EmptyState message="No admin actions recorded" />
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {detail.auditLog.map(entry => (
                      <div key={entry.id} style={{ background: '#0d0d1a', border: '1px solid #2a2a3e', borderRadius: 6, padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ color: '#d4a853', fontFamily: 'monospace', fontSize: 11, minWidth: 110 }}>{fmtDateTime(entry.createdAt)}</div>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: 12, marginRight: 8 }}>{entry.action}</span>
                          <span style={{ color: '#666', fontSize: 11 }}>by {entry.adminEmail}</span>
                          {entry.before && entry.after && (
                            <div style={{ marginTop: 4, fontSize: 11, color: '#555', fontFamily: 'monospace' }}>
                              {JSON.stringify(entry.before)} → {JSON.stringify(entry.after)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </section>

          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontFamily: 'Cinzel, serif', color: '#d4a853', fontSize: 13, letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase', borderBottom: '1px solid #2a2a3e', paddingBottom: 8 }}>{children}</h3>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#ccc' }}>{value}</div>
    </div>
  );
}

function KV({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: '#0d0d1a', border: '1px solid #2a2a3e', borderRadius: 6, padding: '6px 12px' }}>
      <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 13, color: color ?? '#aaa', fontFamily: 'monospace', fontWeight: 600 }}>{value}</div>
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────

type Tab = 'overview' | 'orders' | 'products' | 'users' | 'audit-logs';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');

  const [stats,    setStats]    = useState<Stats | null>(null);
  const [orders,   setOrders]   = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users,    setUsers]    = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    search: '', status: '', paymentStatus: '', provider: '', from: '', to: '',
  });
  const [pendingFilters, setPendingFilters] = useState<Filters>(filters);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [editStock,  setEditStock]  = useState<Record<string, string>>({});
  const [savingStock, setSavingStock] = useState<string | null>(null);
  const [actionMsg, setActionMsg]   = useState<{ id: string; type: 'ok' | 'err'; text: string } | null>(null);

  const filterTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (t: Tab, f: Filters = filters) => {
    setLoading(true); setError(null);
    try {
      if (t === 'overview') {
        const r = await api.get<{ success: boolean; data: Stats }>('/admin/stats');
        setStats(r.data);
      } else if (t === 'orders') {
        const params = new URLSearchParams();
        if (f.search)        params.set('search',        f.search);
        if (f.status)        params.set('status',        f.status);
        if (f.paymentStatus) params.set('paymentStatus', f.paymentStatus);
        if (f.provider)      params.set('provider',      f.provider);
        if (f.from)          params.set('from',          f.from);
        if (f.to)            params.set('to',            f.to);
        const qs = params.toString();
        const r = await api.get<{ success: boolean; data: OrderRow[] }>(`/admin/orders${qs ? `?${qs}` : ''}`);
        setOrders(r.data);
      } else if (t === 'products') {
        const r = await api.get<{ success: boolean; data: Product[] }>('/admin/products');
        setProducts(r.data);
      } else if (t === 'users') {
        const r = await api.get<{ success: boolean; data: User[] }>('/admin/users');
        setUsers(r.data);
      } else if (t === 'audit-logs') {
        const r = await api.get<{ success: boolean; data: AuditEntry[] }>('/admin/audit-logs?limit=200');
        setAuditLogs(r.data);
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(tab); }, [tab]); // eslint-disable-line

  function applyFilters() {
    const next = { ...pendingFilters };
    setFilters(next);
    load('orders', next);
  }

  function clearFilters() {
    const empty: Filters = { search: '', status: '', paymentStatus: '', provider: '', from: '', to: '' };
    setPendingFilters(empty);
    setFilters(empty);
    load('orders', empty);
  }

  function handleOrderStatusUpdated(id: string, orderStatus: string, paymentStatus: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, orderStatus, paymentStatus } : o));
  }

  async function saveStock(productId: string) {
    const val = parseInt(editStock[productId] ?? '');
    if (isNaN(val) || val < 0) { setActionMsg({ id: productId, type: 'err', text: 'Invalid stock value.' }); return; }
    setSavingStock(productId);
    try {
      await api.patch(`/admin/inventory/${productId}`, { stock: val });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: val } : p));
      setEditStock(prev => { const n = { ...prev }; delete n[productId]; return n; });
      setActionMsg({ id: productId, type: 'ok', text: 'Stock updated.' });
    } catch (e: any) {
      setActionMsg({ id: productId, type: 'err', text: e.message ?? 'Failed.' });
    } finally {
      setSavingStock(null);
    }
  }

  async function toggleProductActive(product: Product) {
    try {
      if (product.active) {
        await api.delete(`/admin/products/${product.id}`);
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: false } : p));
      } else {
        const r = await api.put<{ success: boolean; data: Product }>(`/admin/products/${product.id}`, { active: true });
        setProducts(prev => prev.map(p => p.id === product.id ? r.data : p));
      }
    } catch (e: any) {
      setActionMsg({ id: product.id, type: 'err', text: e.message ?? 'Failed.' });
    }
  }

  async function toggleUserRole(u: User) {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Make ${u.name} a ${newRole}?`)) return;
    try {
      await api.patch(`/admin/users/${u.id}/role`, { role: newRole });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x));
    } catch (e: any) {
      setActionMsg({ id: u.id, type: 'err', text: e.message ?? 'Failed.' });
    }
  }

  // ── Access guard ───────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={centeredStyle}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
        <p style={{ color: '#f0c875', fontFamily: 'Cinzel, serif', fontSize: 20, marginBottom: 24 }}>Admin Access Required</p>
        <Link href="/login" style={goldBtn}>Login</Link>
      </div>
    );
  }
  if (user?.role !== 'admin') {
    return (
      <div style={centeredStyle}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>𓂀</div>
        <p style={{ color: '#f87171', fontFamily: 'Cinzel, serif', fontSize: 20, marginBottom: 24 }}>Access Denied — Admins Only.</p>
        <Link href="/" style={goldBtn}>Return Home</Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview',   label: 'Overview',   icon: '📊' },
    { id: 'orders',     label: 'Orders',     icon: '📦' },
    { id: 'products',   label: 'Products',   icon: '🛒' },
    { id: 'users',      label: 'Users',      icon: '👤' },
    { id: 'audit-logs', label: 'Audit Log',  icon: '📋' },
  ];

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div style={{ minHeight: '100vh', background: '#060612', color: '#e8e8e8', fontFamily: 'sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-row:hover { background: #0f0f20 !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg, #0a0a18 0%, #12122a 100%)', borderBottom: '1px solid #2a2a3e', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 20, color: '#f0c875', letterSpacing: 2 }}>GEN ERA — ADMIN</span>
          <span style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 12, padding: '2px 10px', fontSize: 11, color: '#d4a853', fontWeight: 600 }}>CONTROL CENTER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#666', fontSize: 12, fontFamily: 'monospace' }}>{user.email}</span>
          <Link href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 13, border: '1px solid #2a2a3e', borderRadius: 6, padding: '6px 12px' }}>← Store</Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #2a2a3e', background: '#0a0a18', padding: '0 24px', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #d4a853' : '2px solid transparent', color: tab === t.id ? '#f0c875' : '#555', cursor: 'pointer', padding: '14px 20px', fontSize: 13, fontFamily: 'Cinzel, serif', letterSpacing: 1, whiteSpace: 'nowrap', transition: 'color 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
          <button onClick={() => load(tab, filters)} style={{ ...smallBtn, borderColor: '#3a3a5e', color: '#888' }}>⟳ Refresh</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px 32px', maxWidth: 1280, margin: '0 auto' }}>
        {error && <ErrorBanner message={error} onRetry={() => load(tab)} />}

        {/* ── OVERVIEW ───────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div>
            {loading && <Spinner />}
            {!loading && stats && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
                  <StatCard label="Total Revenue"  value={fmtPrice(stats.revenue)}  icon="💰" />
                  <StatCard label="Orders"         value={stats.orders}              icon="📦" />
                  <StatCard label="Products"       value={stats.products}            icon="🛒" />
                  <StatCard label="Users"          value={stats.users}               icon="👤" />
                </div>
                <h2 style={sectionTitle}>Recent Orders</h2>
                {stats.recentOrders.length === 0 ? <EmptyState message="No orders yet" /> : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
                      <thead><tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                        {['Order #', 'Customer', 'Total', 'Status', 'Payment', 'Date'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {stats.recentOrders.map(o => (
                          <tr key={o.id} className="admin-row" style={{ borderBottom: '1px solid #1a1a2e' }}>
                            <td style={tdStyle}><span style={{ color: '#d4a853', fontFamily: 'monospace', fontSize: 12 }}>{o.orderNumber}</span></td>
                            <td style={tdStyle}>{o.customerName}</td>
                            <td style={tdStyle}>{fmtPrice(o.totalPrice)}</td>
                            <td style={tdStyle}><Badge text={o.orderStatus} /></td>
                            <td style={tdStyle}><Badge text={o.paymentStatus} /></td>
                            <td style={{ ...tdStyle, color: '#666', fontSize: 12 }}>{fmtDate(o.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── ORDERS ─────────────────────────────────────────────────────────── */}
        {tab === 'orders' && (
          <div>
            {/* Filter bar */}
            <div style={{ background: '#0d0d1a', border: '1px solid #2a2a3e', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Filter Orders</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ flex: '2 1 200px' }}>
                  <label style={labelStyle}>Search</label>
                  <input
                    type="text"
                    placeholder="Name, email, order #..."
                    value={pendingFilters.search}
                    onChange={e => setPendingFilters(p => ({ ...p, search: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && applyFilters()}
                    style={filterInputStyle}
                  />
                </div>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={labelStyle}>Order Status</label>
                  <select value={pendingFilters.status} onChange={e => setPendingFilters(p => ({ ...p, status: e.target.value }))} style={filterInputStyle}>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s || 'All'}</option>)}
                  </select>
                </div>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={labelStyle}>Payment</label>
                  <select value={pendingFilters.paymentStatus} onChange={e => setPendingFilters(p => ({ ...p, paymentStatus: e.target.value }))} style={filterInputStyle}>
                    {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s || 'All'}</option>)}
                  </select>
                </div>
                <div style={{ flex: '1 1 100px' }}>
                  <label style={labelStyle}>Provider</label>
                  <select value={pendingFilters.provider} onChange={e => setPendingFilters(p => ({ ...p, provider: e.target.value }))} style={filterInputStyle}>
                    {PROVIDERS.map(s => <option key={s} value={s}>{s || 'All'}</option>)}
                  </select>
                </div>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={labelStyle}>From</label>
                  <input type="date" value={pendingFilters.from} onChange={e => setPendingFilters(p => ({ ...p, from: e.target.value }))} style={filterInputStyle} />
                </div>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={labelStyle}>To</label>
                  <input type="date" value={pendingFilters.to} onChange={e => setPendingFilters(p => ({ ...p, to: e.target.value }))} style={filterInputStyle} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={applyFilters} style={{ ...smallBtn, borderColor: '#d4a853', color: '#d4a853', padding: '8px 16px' }}>Apply</button>
                  {hasActiveFilters && <button onClick={clearFilters} style={{ ...smallBtn, borderColor: '#555', color: '#555', padding: '8px 16px' }}>Clear</button>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ ...sectionTitle, margin: 0 }}>
                Orders — {orders.length} result{orders.length !== 1 ? 's' : ''}
                {hasActiveFilters && <span style={{ color: '#60a5fa', fontSize: 12, marginLeft: 8 }}>· Filtered</span>}
              </h2>
            </div>

            {loading && <Spinner />}
            {!loading && orders.length === 0 && <EmptyState message="No orders match the current filters" />}
            {!loading && orders.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead><tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                    {['Order #', 'Customer', 'City', 'Total', 'Order Status', 'Payment', 'Provider', 'Date', ''].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="admin-row" style={{ borderBottom: '1px solid #1a1a2e', cursor: 'pointer' }} onClick={() => setSelectedOrderId(o.id)}>
                        <td style={tdStyle}><span style={{ color: '#d4a853', fontFamily: 'monospace', fontSize: 11 }}>{o.orderNumber}</span></td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 500 }}>{o.customerName}</div>
                          <div style={{ color: '#555', fontSize: 11 }}>{o.customerEmail}</div>
                        </td>
                        <td style={{ ...tdStyle, color: '#888', fontSize: 12 }}>{o.customerCity}</td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#f0c875' }}>{fmtPrice(o.totalPrice)}</td>
                        <td style={tdStyle}><Badge text={o.orderStatus} /></td>
                        <td style={tdStyle}><Badge text={o.paymentStatus} /></td>
                        <td style={{ ...tdStyle, color: '#666', fontSize: 12 }}>{o.paymentProvider ?? '—'}</td>
                        <td style={{ ...tdStyle, color: '#555', fontSize: 11 }}>{fmtDate(o.createdAt)}</td>
                        <td style={tdStyle}>
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedOrderId(o.id); }}
                            style={{ ...smallBtn, borderColor: '#3a3a5e', color: '#888', fontSize: 11 }}
                          >View →</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS ───────────────────────────────────────────────────────── */}
        {tab === 'products' && (
          <div>
            <h2 style={sectionTitle}>Products ({products.length})</h2>
            {loading && <Spinner />}
            {!loading && products.length === 0 && <EmptyState message="No products found" />}
            {!loading && products.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead><tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                    {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="admin-row" style={{ borderBottom: '1px solid #1a1a2e', opacity: p.active ? 1 : 0.45 }}>
                        <td style={tdStyle}>
                          {p.image
                            ? <img src={p.image} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #2a2a3e' }} />
                            : <div style={{ width: 44, height: 44, background: '#1a1a2e', borderRadius: 6 }} />}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, color: '#f0c875' }}>{p.name}</div>
                          <div style={{ color: '#555', fontSize: 11, fontFamily: 'monospace' }}>{p.slug}</div>
                        </td>
                        <td style={{ ...tdStyle, color: '#888', fontSize: 12 }}>{p.category}</td>
                        <td style={tdStyle}>{fmtPrice(p.price)}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                              type="number" min={0}
                              value={editStock[p.id] ?? p.stock}
                              onChange={e => setEditStock(prev => ({ ...prev, [p.id]: e.target.value }))}
                              style={{ width: 64, background: '#12122a', border: '1px solid #2a2a3e', color: '#f0c875', borderRadius: 6, padding: '4px 8px', fontSize: 13 }}
                            />
                            {editStock[p.id] !== undefined && (
                              <button onClick={() => saveStock(p.id)} disabled={savingStock === p.id} style={{ ...smallBtn, borderColor: '#4ade80', color: '#4ade80' }}>
                                {savingStock === p.id ? '…' : '✓'}
                              </button>
                            )}
                          </div>
                          {actionMsg?.id === p.id && <div style={{ fontSize: 11, color: actionMsg.type === 'ok' ? '#4ade80' : '#f87171', marginTop: 4 }}>{actionMsg.text}</div>}
                        </td>
                        <td style={tdStyle}><span style={{ color: p.active ? '#4ade80' : '#666', fontSize: 12 }}>{p.active ? '● Live' : '● Hidden'}</span></td>
                        <td style={tdStyle}>
                          <button onClick={() => toggleProductActive(p)} style={{ ...smallBtn, borderColor: p.active ? '#f87171' : '#4ade80', color: p.active ? '#f87171' : '#4ade80' }}>
                            {p.active ? 'Hide' : 'Show'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── USERS ──────────────────────────────────────────────────────────── */}
        {tab === 'users' && (
          <div>
            <h2 style={sectionTitle}>Users ({users.length})</h2>
            {loading && <Spinner />}
            {!loading && users.length === 0 && <EmptyState message="No users found" />}
            {!loading && users.length > 0 && (
              <table style={tableStyle}>
                <thead><tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                  {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="admin-row" style={{ borderBottom: '1px solid #1a1a2e' }}>
                      <td style={tdStyle}>{u.name}</td>
                      <td style={{ ...tdStyle, color: '#888', fontSize: 12, fontFamily: 'monospace' }}>{u.email}</td>
                      <td style={tdStyle}><Badge text={u.role} /></td>
                      <td style={{ ...tdStyle, color: '#555', fontSize: 12 }}>{fmtDate(u.createdAt)}</td>
                      <td style={tdStyle}>
                        <button onClick={() => toggleUserRole(u)} style={{ ...smallBtn, borderColor: u.role === 'admin' ? '#f87171' : '#d4a853', color: u.role === 'admin' ? '#f87171' : '#d4a853' }}>
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        {actionMsg?.id === u.id && <div style={{ fontSize: 11, color: actionMsg.type === 'ok' ? '#4ade80' : '#f87171', marginTop: 4 }}>{actionMsg.text}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── AUDIT LOG ──────────────────────────────────────────────────────── */}
        {tab === 'audit-logs' && (
          <div>
            <h2 style={sectionTitle}>Audit Log — Recent Admin Actions ({auditLogs.length})</h2>
            {loading && <Spinner />}
            {!loading && auditLogs.length === 0 && <EmptyState message="No admin actions recorded yet" />}
            {!loading && auditLogs.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead><tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                    {['Time', 'Admin', 'Action', 'Target', 'Before', 'After', 'IP'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {auditLogs.map(entry => (
                      <tr key={entry.id} className="admin-row" style={{ borderBottom: '1px solid #1a1a2e' }}>
                        <td style={{ ...tdStyle, color: '#555', fontSize: 11, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{fmtDateTime(entry.createdAt)}</td>
                        <td style={{ ...tdStyle, color: '#888', fontSize: 12 }}>{entry.adminEmail}</td>
                        <td style={tdStyle}><span style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: 12 }}>{entry.action}</span></td>
                        <td style={tdStyle}>
                          <span style={{ color: '#d4a853', fontSize: 11 }}>{entry.targetType}</span>
                          {entry.targetId && (
                            <div style={{ color: '#555', fontSize: 10, fontFamily: 'monospace' }}>
                              {entry.targetId.length > 16 ? entry.targetId.slice(0, 16) + '…' : entry.targetId}
                            </div>
                          )}
                        </td>
                        <td style={{ ...tdStyle, color: '#f87171', fontSize: 11, fontFamily: 'monospace', maxWidth: 140 }}>
                          {entry.before ? JSON.stringify(entry.before).slice(0, 60) : '—'}
                        </td>
                        <td style={{ ...tdStyle, color: '#4ade80', fontSize: 11, fontFamily: 'monospace', maxWidth: 140 }}>
                          {entry.after ? JSON.stringify(entry.after).slice(0, 60) : '—'}
                        </td>
                        <td style={{ ...tdStyle, color: '#444', fontSize: 11, fontFamily: 'monospace' }}>{entry.ip ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Panel */}
      {selectedOrderId && (
        <OrderDetailPanel
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusUpdated={handleOrderStatusUpdated}
        />
      )}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const centeredStyle: React.CSSProperties = {
  minHeight: '100vh', background: '#060612', display: 'flex',
  flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
};

const goldBtn: React.CSSProperties = {
  background: 'linear-gradient(135deg, #d4a853, #f0c875)', color: '#000',
  padding: '10px 24px', borderRadius: 8, fontFamily: 'Cinzel, serif',
  fontWeight: 700, textDecoration: 'none', fontSize: 14,
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Cinzel, serif', color: '#d4a853', fontSize: 16, marginBottom: 16, letterSpacing: 1,
};

const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', background: '#0a0a18',
  border: '1px solid #2a2a3e', borderRadius: 10, overflow: 'hidden',
};

const thStyle: React.CSSProperties = {
  padding: '12px 14px', textAlign: 'left', color: '#555', fontSize: 10,
  textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600, whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '11px 14px', verticalAlign: 'middle', fontSize: 13,
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5,
};

const filterInputStyle: React.CSSProperties = {
  background: '#12122a', border: '1px solid #2a2a3e', color: '#e8e8e8',
  borderRadius: 6, padding: '7px 10px', fontSize: 13, width: '100%',
  outline: 'none', boxSizing: 'border-box',
};

const smallBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid #444', borderRadius: 6,
  padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
};
