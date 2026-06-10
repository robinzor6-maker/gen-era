import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useWishlistStore, useCartStore } from '@/lib/store';
import { useProductStore } from '@/stores/productStore';
import { Product } from '@/lib/types';
import WishlistButton from '@/components/store/WishlistButton';

function formatPrice(price: number): string {
  return price.toLocaleString('ar-EG') + ' ج.م';
}

export default function WishlistPage() {
  const wishlistIds = useWishlistStore((s) => s.items);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addToCart = useCartStore((s) => s.addToCart);
  const cartCount = useCartStore((s) => s.cartCount);
  const setIsOpen = useCartStore((s) => s.setIsOpen);
  const { products, fetchProducts } = useProductStore();

  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts({ limit: '50' });
  }, [fetchProducts]);

  useEffect(() => {
    const matched = products.filter((p) => wishlistIds.includes(p._id));
    setWishlistProducts(matched);
  }, [products, wishlistIds]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <main className="product-detail-page animate-fade-up" style={{ minHeight: '100vh' }}>
      <header className="store-header">
        <div className="store-header-inner">
          <Link href="/store" className="back-link font-mono">← BACK TO ARCHIVE</Link>
          <div className="store-title-wrap">
            <span className="label store-eyebrow">GEN ERA — SAVED ARTIFACTS</span>
            <h1 className="store-title font-display">WISHLIST</h1>
          </div>
          <button className="btn-gold font-mono" style={{ fontSize: '0.75rem', padding: '6px 14px' }} onClick={() => setIsOpen(true)}>
            CART <span style={{ color: 'var(--fire)' }}>{cartCount}</span>
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {wishlistProducts.length === 0 ? (
          <div className="store-empty" style={{ marginTop: '80px' }}>
            <span className="empty-glyph font-display">♡</span>
            <h2 className="font-cinzel">THE SANCTUM IS EMPTY</h2>
            <p className="text-muted">No artifacts have been marked for preservation.</p>
            <Link href="/store" className="btn-gold" style={{ marginTop: '24px', padding: '10px 24px', display: 'inline-block', textDecoration: 'none' }}>
              EXPLORE THE ARCHIVE
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <p className="font-mono" style={{ fontSize: '0.72rem', color: 'rgba(212,168,83,0.5)', letterSpacing: '0.15em' }}>
                {wishlistProducts.length} ARTIFACT{wishlistProducts.length !== 1 ? 'S' : ''} PRESERVED
              </p>
              <button
                className="font-mono"
                onClick={clearWishlist}
                style={{
                  background: 'none', border: '1px solid rgba(212,168,83,0.15)',
                  color: 'rgba(212,168,83,0.35)', fontSize: '0.65rem',
                  letterSpacing: '0.12em', padding: '6px 14px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                CLEAR ALL
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {wishlistProducts.map((product) => {
                const isOutOfStock = product.stock === 0;
                const hasDiscount = product.comparePrice && product.comparePrice > product.price;
                const discountPct = hasDiscount ? Math.round((1 - product.price / product.comparePrice!) * 100) : 0;

                return (
                  <article key={product._id} className="visual-panel" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <span className="corner-mark tl" aria-hidden="true" />
                    <span className="corner-mark tr" aria-hidden="true" />
                    <span className="corner-mark bl" aria-hidden="true" />
                    <span className="corner-mark br" aria-hidden="true" />

                    {/* Image */}
                    <Link href={`/store/${product.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                      <div style={{ position: 'relative', aspectRatio: '1', background: 'rgba(212,168,83,0.02)', overflow: 'hidden' }}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '3rem', opacity: 0.15 }}>𓂀</span>
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: 10, right: 10 }}>
                          <WishlistButton productId={product._id} size="sm" />
                        </div>
                        {hasDiscount && (
                          <div style={{
                            position: 'absolute', top: 10, left: 10,
                            background: 'rgba(255,107,26,0.85)', color: '#fff',
                            fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.1em', padding: '2px 8px',
                          }}>
                            −{discountPct}%
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <span className="label" style={{ fontSize: '0.62rem' }}>{product.collection?.replace(/-/g, ' ').toUpperCase()}</span>
                      <Link href={`/store/${product.slug}`} style={{ textDecoration: 'none' }}>
                        <h2 className="font-cinzel" style={{ fontSize: '0.9rem', letterSpacing: '0.05em', color: '#fff', lineHeight: 1.3 }}>
                          {product.name}
                        </h2>
                      </Link>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                        <span className="font-mono" style={{ fontSize: '1rem', color: '#f0c875', textShadow: 'var(--glow-gold)' }}>
                          {formatPrice(product.price)}
                        </span>
                        {hasDiscount && (
                          <span className="font-mono" style={{ fontSize: '0.72rem', color: 'rgba(212,168,83,0.3)', textDecoration: 'line-through' }}>
                            {formatPrice(product.comparePrice!)}
                          </span>
                        )}
                      </div>

                      <div className="font-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                        {isOutOfStock ? (
                          <span style={{ color: 'rgba(212,168,83,0.3)' }}>DEPLETED</span>
                        ) : (
                          <span className="status-in-stock">AVAILABLE</span>
                        )}
                      </div>

                      <button
                        className={isOutOfStock ? 'btn-gold' : 'btn-fire'}
                        onClick={() => {
                          if (!isOutOfStock) {
                            addToCart(product, 1);
                            showToast(`✓ ${product.name} — ADDED`);
                          }
                        }}
                        disabled={isOutOfStock}
                        style={{ marginTop: 'auto', padding: '10px', fontSize: '0.72rem', letterSpacing: '0.12em' }}
                      >
                        {isOutOfStock ? '— DEPLETED —' : '⚡ ADD TO CART'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className="font-mono" style={{
          position: 'fixed', bottom: 48, left: '50%', transform: 'translateX(-50%)',
          zIndex: 999, padding: '10px 28px',
          background: 'rgba(0,0,5,0.98)', border: '1px solid #d4a853',
          color: '#f0c875', letterSpacing: '0.12em', fontSize: '0.72rem',
          boxShadow: 'var(--glow-gold)', whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}
    </main>
  );
}
