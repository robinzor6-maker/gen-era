import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'wouter';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/hooks';

// ── Types ─────────────────────────────────────────────────────────────────

interface Stats {
  products: number;
  orders: number;
  users: number;
  revenue: number;
  recentOrders: Order[];
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

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAY_STATUSES   = ['unpaid', 'paid', 'failed', 'refunded'];

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// ── Sub-components ────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%)',
      border: '1px solid #2a2a3e',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <span style={{ fontSize: 32 }}>{icon}</span>
      <div>
        <div style={{ color: '#888', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
        <div style={{ color: '#f0c875', fontSize: 24, fontWeight: 700, fontFamily: 'Cinzel, serif' }}>{value}</div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

type Tab = 'overview' | 'orders' | 'products' | 'users';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');

  const [stats, setStats]       = useState<Stats | null>(null);
  const [orders, setOrders]     = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers]       = useState<User[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [editStock, setEditStock]   = useState<Record<string, string>>({});
  const [savingStock, setSavingStock] = useState<string | null>(null);

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    setError(null);
    try {
      if (t === 'overview') {
        const r = await api.get<{ success: boolean; data: Stats }>('/admin/stats');
        setStats(r.data);
      } else if (t === 'orders') {
        const r = await api.get<{ success: boolean; data: Order[] }>('/admin/orders');
        setOrders(r.data);
      } else if (t === 'products') {
        const r = await api.get<{ success: boolean; data: Product[] }>('/admin/products');
        setProducts(r.data);
      } else if (t === 'users') {
        const r = await api.get<{ success: boolean; data: User[] }>('/admin/users');
        setUsers(r.data);
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  async function updateOrderStatus(id: string, orderStatus: string, paymentStatus: string) {
    try {
      await api.patch(`/admin/orders/${id}/status`, { orderStatus, paymentStatus });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, orderStatus, paymentStatus } : o));
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  }

  async function saveStock(productId: string) {
    const val = parseInt(editStock[productId] ?? '');
    if (isNaN(val) || val < 0) { alert('Enter a valid stock number.'); return; }
    setSavingStock(productId);
    try {
      await api.patch(`/admin/inventory/${productId}`, { stock: val });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: val } : p));
      setEditStock(prev => { const n = { ...prev }; delete n[productId]; return n; });
    } catch (e: any) {
      alert('Error: ' + e.message);
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
      alert('Error: ' + e.message);
    }
  }

  async function toggleUserRole(u: User) {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Make ${u.name} a ${newRole}?`)) return;
    try {
      await api.patch(`/admin/users/${u.id}/role`, { role: newRole });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x));
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  }

  // ── Access guard ──────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={centeredStyle}>
        <p style={{ color: '#f0c875', fontFamily: 'Cinzel, serif', fontSize: 20 }}>You must be logged in.</p>
        <Link href="/login" style={goldBtn}>Go to Login</Link>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div style={centeredStyle}>
        <p style={{ color: '#f87171', fontFamily: 'Cinzel, serif', fontSize: 20 }}>Access Denied — Admins Only.</p>
        <Link href="/" style={goldBtn}>Return Home</Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview',  label: 'Overview',  icon: '📊' },
    { id: 'orders',    label: 'Orders',    icon: '📦' },
    { id: 'products',  label: 'Products',  icon: '🛒' },
    { id: 'users',     label: 'Users',     icon: '👤' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#060612', color: '#e8e8e8', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, #0a0a18 0%, #12122a 100%)',
        borderBottom: '1px solid #2a2a3e',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>⚡</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#f0c875', letterSpacing: 2 }}>GEN ERA — ADMIN</span>
        </div>
        <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>← Back to Store</Link>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #2a2a3e', background: '#0a0a18', padding: '0 24px' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid #d4a853' : '2px solid transparent',
              color: tab === t.id ? '#f0c875' : '#666',
              cursor: 'pointer',
              padding: '14px 24px',
              fontSize: 14,
              fontFamily: 'Cinzel, serif',
              letterSpacing: 1,
              transition: 'color 0.2s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
        {loading && <div style={{ textAlign: 'center', color: '#d4a853', padding: 60, fontSize: 18 }}>Loading…</div>}
        {error  && <div style={{ color: '#f87171', background: '#1a0a0a', padding: 16, borderRadius: 8, marginBottom: 24 }}>⚠ {error}</div>}

        {/* OVERVIEW */}
        {tab === 'overview' && stats && !loading && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
              <StatCard label="Total Revenue"  value={formatPrice(stats.revenue)}  icon="💰" />
              <StatCard label="Orders"         value={stats.orders}                icon="📦" />
              <StatCard label="Products"       value={stats.products}              icon="🛒" />
              <StatCard label="Users"          value={stats.users}                 icon="👤" />
            </div>

            <h2 style={sectionTitle}>Recent Orders</h2>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                  {['Order #', 'Customer', 'Total', 'Status', 'Payment', 'Date'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #1a1a2e' }}>
                    <td style={tdStyle}><span style={{ color: '#d4a853', fontFamily: 'monospace' }}>{o.orderNumber}</span></td>
                    <td style={tdStyle}>{o.customerName}</td>
                    <td style={tdStyle}>{formatPrice(o.totalPrice)}</td>
                    <td style={tdStyle}><Badge text={o.orderStatus} /></td>
                    <td style={tdStyle}><Badge text={o.paymentStatus} /></td>
                    <td style={tdStyle}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && !loading && (
          <div>
            <h2 style={sectionTitle}>All Orders ({orders.length})</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                    {['Order #', 'Customer', 'Email', 'Total', 'Order Status', 'Payment', 'Date'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #1a1a2e' }}>
                      <td style={tdStyle}><span style={{ color: '#d4a853', fontFamily: 'monospace', fontSize: 12 }}>{o.orderNumber}</span></td>
                      <td style={tdStyle}>{o.customerName}</td>
                      <td style={{ ...tdStyle, color: '#888', fontSize: 12 }}>{o.customerEmail}</td>
                      <td style={tdStyle}>{formatPrice(o.totalPrice)}</td>
                      <td style={tdStyle}>
                        <select
                          value={o.orderStatus}
                          onChange={e => updateOrderStatus(o.id, e.target.value, o.paymentStatus)}
                          style={selectStyle}
                        >
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={tdStyle}>
                        <select
                          value={o.paymentStatus}
                          onChange={e => updateOrderStatus(o.id, o.orderStatus, e.target.value)}
                          style={selectStyle}
                        >
                          {PAY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ ...tdStyle, color: '#666', fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && !loading && (
          <div>
            <h2 style={sectionTitle}>Products ({products.length})</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                    {['Image', 'Name', 'Category', 'Price', 'Stock', 'Active', 'Actions'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #1a1a2e', opacity: p.active ? 1 : 0.45 }}>
                      <td style={tdStyle}>
                        {p.image
                          ? <img src={p.image} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #2a2a3e' }} />
                          : <div style={{ width: 44, height: 44, background: '#1a1a2e', borderRadius: 6 }} />}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: '#f0c875' }}>{p.name}</div>
                        <div style={{ color: '#666', fontSize: 11 }}>{p.slug}</div>
                      </td>
                      <td style={{ ...tdStyle, color: '#888', fontSize: 12 }}>{p.category}</td>
                      <td style={tdStyle}>{formatPrice(p.price)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="number"
                            min={0}
                            value={editStock[p.id] ?? p.stock}
                            onChange={e => setEditStock(prev => ({ ...prev, [p.id]: e.target.value }))}
                            style={{ width: 64, background: '#12122a', border: '1px solid #2a2a3e', color: '#f0c875', borderRadius: 6, padding: '4px 8px', fontSize: 13 }}
                          />
                          {editStock[p.id] !== undefined && (
                            <button
                              onClick={() => saveStock(p.id)}
                              disabled={savingStock === p.id}
                              style={{ ...smallBtn, background: '#1a3a1a', borderColor: '#4ade80', color: '#4ade80' }}
                            >
                              {savingStock === p.id ? '…' : '✓'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: p.active ? '#4ade80' : '#f87171', fontSize: 13 }}>
                          {p.active ? '● Live' : '● Hidden'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => toggleProductActive(p)}
                          style={{ ...smallBtn, borderColor: p.active ? '#f87171' : '#4ade80', color: p.active ? '#f87171' : '#4ade80' }}
                        >
                          {p.active ? 'Hide' : 'Show'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && !loading && (
          <div>
            <h2 style={sectionTitle}>Users ({users.length})</h2>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                  {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1a1a2e' }}>
                    <td style={tdStyle}>{u.name}</td>
                    <td style={{ ...tdStyle, color: '#888', fontSize: 12 }}>{u.email}</td>
                    <td style={tdStyle}>
                      <span style={{
                        background: u.role === 'admin' ? '#2a1a00' : '#0a1a2a',
                        color: u.role === 'admin' ? '#d4a853' : '#60a5fa',
                        border: `1px solid ${u.role === 'admin' ? '#d4a853' : '#60a5fa'}`,
                        borderRadius: 12,
                        padding: '2px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#666', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => toggleUserRole(u)}
                        style={{ ...smallBtn, borderColor: u.role === 'admin' ? '#f87171' : '#d4a853', color: u.role === 'admin' ? '#f87171' : '#d4a853' }}
                      >
                        {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────

function Badge({ text }: { text: string }) {
  return (
    <span style={{
      background: '#12122a',
      color: statusColor(text),
      border: `1px solid ${statusColor(text)}44`,
      borderRadius: 12,
      padding: '2px 10px',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    }}>
      {text}
    </span>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const centeredStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#060612',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 24,
};

const goldBtn: React.CSSProperties = {
  background: 'linear-gradient(135deg, #d4a853, #f0c875)',
  color: '#000',
  padding: '10px 24px',
  borderRadius: 8,
  fontFamily: 'Cinzel, serif',
  fontWeight: 700,
  textDecoration: 'none',
  fontSize: 14,
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Cinzel, serif',
  color: '#d4a853',
  fontSize: 18,
  marginBottom: 16,
  letterSpacing: 1,
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  background: '#0a0a18',
  border: '1px solid #2a2a3e',
  borderRadius: 10,
  overflow: 'hidden',
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  color: '#888',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 1,
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  verticalAlign: 'middle',
  fontSize: 14,
};

const selectStyle: React.CSSProperties = {
  background: '#12122a',
  border: '1px solid #2a2a3e',
  color: '#f0c875',
  borderRadius: 6,
  padding: '4px 8px',
  fontSize: 12,
  cursor: 'pointer',
};

const smallBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #444',
  borderRadius: 6,
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'opacity 0.2s',
};

function statusColor(s: string) {
  if (s === 'paid' || s === 'delivered') return '#4ade80';
  if (s === 'shipped' || s === 'processing') return '#60a5fa';
  if (s === 'cancelled' || s === 'failed') return '#f87171';
  return '#d4a853';
}
