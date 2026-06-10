import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/hooks';

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { register, isAuthenticated } = useAuth();

  const [name,     setName]     = useState('');
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

    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      navigate('/');
    } catch (err: unknown) {
      // @ts-ignore
      setError(err.message || 'Registration failed. Please try again.');
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
            <span className="label store-eyebrow">GEN ERA — CREATE IDENTITY</span>
            <h1 className="store-title font-display">REGISTER</h1>
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
              𓋹
            </span>
            <h2 className="font-cinzel" style={{ fontSize: '1.1rem', letterSpacing: '0.2em', color: '#fff', marginBottom: '4px' }}>
              JOIN THE TEMPLE
            </h2>
            <p className="text-muted font-mono" style={{ fontSize: '0.75rem' }}>
              Create your account to track orders
            </p>
          </div>

          {error && (
            <div className="validation-error font-mono" role="alert" style={{ borderColor: 'var(--red-live)', color: 'var(--red-live)', background: 'rgba(204,17,17,0.05)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="font-mono label-input" htmlFor="register-name">FULL NAME</label>
              <input
                id="register-name"
                type="text"
                className="checkout-input font-cinzel"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="font-mono label-input" htmlFor="register-email">EMAIL ADDRESS</label>
              <input
                id="register-email"
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
              <label className="font-mono label-input" htmlFor="register-password">PASSWORD</label>
              <input
                id="register-password"
                type="password"
                className="checkout-input font-mono"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn-fire"
              style={{ width: '100%', padding: '16px', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '0.9rem', letterSpacing: '0.1em' }}
              disabled={loading}
            >
              {loading ? 'CREATING IDENTITY...' : 'ENTER THE TEMPLE ⚡'}
            </button>
          </form>

          <div className="info-divider" />

          <p className="text-muted font-mono" style={{ textAlign: 'center', fontSize: '0.78rem' }}>
            ALREADY HAVE AN ACCOUNT?{' '}
            <Link href="/login" className="font-mono" style={{ color: 'var(--sand2)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              LOGIN →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
