import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/hooks';

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/');
    } catch (err: unknown) {
      // @ts-ignore
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="product-detail-page animate-fade-up" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="store-header">
        <div className="store-header-inner">
          <Link href="/" className="back-link font-mono">← TEMPLE</Link>
          <div className="store-title-wrap">
            <span className="label store-eyebrow">GEN ERA — IDENTITY VERIFICATION</span>
            <h1 className="store-title font-display">LOGIN</h1>
          </div>
          <div style={{ width: '40px' }} />
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="visual-panel" style={{ width: '100%', maxWidth: '460px', padding: '40px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <span className="corner-mark tl" aria-hidden="true" />
          <span className="corner-mark tr" aria-hidden="true" />
          <span className="corner-mark bl" aria-hidden="true" />
          <span className="corner-mark br" aria-hidden="true" />

          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span className="font-display" style={{ fontSize: '3rem', display: 'block', marginBottom: '12px', filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.4))' }}>
              𓂀
            </span>
            <h2 className="font-cinzel" style={{ fontSize: '1.1rem', letterSpacing: '0.2em', color: '#fff', marginBottom: '4px' }}>
              ACCESS THE ARCHIVE
            </h2>
            <p className="text-muted font-mono" style={{ fontSize: '0.75rem' }}>
              Authentication required to place orders
            </p>
          </div>

          {error && (
            <div className="validation-error font-mono" role="alert" style={{ borderColor: 'var(--red-live)', color: 'var(--red-live)', background: 'rgba(204,17,17,0.05)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="font-mono label-input" htmlFor="login-email">EMAIL ADDRESS</label>
              <input
                id="login-email"
                type="email"
                className="checkout-input font-mono"
                placeholder="acquisitor@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="font-mono label-input" htmlFor="login-password">PASSWORD</label>
              <input
                id="login-password"
                type="password"
                className="checkout-input font-mono"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-fire"
              style={{ width: '100%', padding: '16px', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '0.9rem', letterSpacing: '0.1em' }}
              disabled={loading}
            >
              {loading ? 'VERIFYING IDENTITY...' : 'ENTER THE ARCHIVE ⚡'}
            </button>
          </form>

          <div className="info-divider" />

          <p className="text-muted font-mono" style={{ textAlign: 'center', fontSize: '0.78rem' }}>
            NO ACCOUNT YET?{' '}
            <Link href="/register" className="font-mono" style={{ color: 'var(--sand2)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              CREATE ONE →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
