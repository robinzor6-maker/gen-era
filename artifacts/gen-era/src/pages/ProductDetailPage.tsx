import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';
import { useProductStore } from '@/stores/productStore';
import ProductViewer from '@/components/store/ProductViewer';
import ProductGallery from '@/components/store/ProductGallery';
import WishlistButton from '@/components/store/WishlistButton';
import { useCartStore } from '@/lib/store';

function formatPrice(price: number): string {
  return price.toLocaleString('ar-EG') + ' ج.م';
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const {
    selectedProduct: product,
    loading,
    error,
    fetchProduct,
    clearSelection,
  } = useProductStore();

  const addToCart = useCartStore((s) => s.addToCart);
  const cartCount = useCartStore((s) => s.cartCount);
  const setIsOpen = useCartStore((s) => s.setIsOpen);

  const [activeTab, setActiveTab] = useState<'3d' | 'gallery'>('gallery');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct(slug);
    return () => { clearSelection(); };
  }, [slug, fetchProduct, clearSelection]);

  useEffect(() => {
    if (product?.modelPath) {
      setActiveTab('3d');
    } else {
      setActiveTab('gallery');
    }
    if (product?.sizes?.length) {
      setSelectedSize(product.sizes[0]);
    }
    if (product?.colors?.length) {
      setSelectedColor(product.colors[0].name);
    }
    setQty(1);
  }, [product]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleAddToCart() {
    if (!product) return;
    if (product.stock === 0) {
      showToast('DEPLETED — THIS ARTIFACT IS NO LONGER AVAILABLE');
      return;
    }
    addToCart(product, qty, selectedSize, selectedColor);
    showToast(`✓ ${product.name} — ADDED TO CART`);
  }

  if (loading) {
    return (
      <main className="product-detail-page detail-loading-page">
        <header className="store-header">
          <div className="store-header-inner">
            <Link href="/store" className="back-link font-mono">← BACK TO ARCHIVE</Link>
            <div className="store-title-wrap">
              <span className="label store-eyebrow">GEN ERA — ACCESSING DATA</span>
              <h1 className="store-title font-display">RETRIEVING...</h1>
            </div>
            <button className="btn-gold font-mono" style={{ fontSize: '0.75rem', padding: '6px 14px' }} onClick={() => setIsOpen(true)}>
              CART <span style={{ color: 'var(--fire)' }}>{cartCount}</span>
            </button>
          </div>
        </header>
        <div className="detail-container">
          <div className="detail-visual-col">
            <div className="skeleton-viewer skeleton" />
          </div>
          <div className="detail-info-col">
            <div className="skeleton-details">
              <div className="skeleton-line large skeleton" />
              <div className="skeleton-line medium skeleton" />
              <div className="skeleton-line short skeleton" />
              <div className="skeleton-line button skeleton" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-detail-page error-page">
        <header className="store-header">
          <div className="store-header-inner">
            <Link href="/store" className="back-link font-mono">← BACK TO ARCHIVE</Link>
            <div className="store-title-wrap">
              <span className="label store-eyebrow">GEN ERA — ERROR</span>
              <h1 className="store-title font-display">NOT FOUND</h1>
            </div>
            <button className="btn-gold font-mono" style={{ fontSize: '0.75rem', padding: '6px 14px' }} onClick={() => setIsOpen(true)}>
              CART <span style={{ color: 'var(--fire)' }}>{cartCount}</span>
            </button>
          </div>
        </header>
        <div className="store-empty" style={{ margin: '80px auto' }}>
          <span className="empty-glyph font-display">𓂀</span>
          <h2 className="font-cinzel">PRODUCT NOT FOUND</h2>
          <p className="text-muted">{error || 'The requested artifact could not be retrieved from the archive.'}</p>
          <Link href="/store" className="btn-gold" style={{ marginTop: '20px', padding: '10px 20px', display: 'inline-block', textDecoration: 'none' }}>
            RETURN TO SHOP
          </Link>
        </div>
      </main>
    );
  }

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.comparePrice!) * 100) : 0;
  const isOutOfStock = product.stock === 0;

  return (
    <main className="product-detail-page animate-fade-up">
      <header className="store-header">
        <div className="store-header-inner">
          <Link href="/store" className="back-link font-mono">← BACK TO ARCHIVE</Link>
          <div className="store-title-wrap">
            <span className="label store-eyebrow">GEN ERA — {product.collection?.replace(/-/g, ' ').toUpperCase()}</span>
            <h1 className="store-title font-display">{product.name}</h1>
          </div>
          <button className="btn-gold font-mono" style={{ fontSize: '0.75rem', padding: '6px 14px' }} onClick={() => setIsOpen(true)}>
            CART <span style={{ color: 'var(--fire)' }}>{cartCount}</span>
          </button>
        </div>
      </header>

      <div className="detail-container">
        {/* ── Visual Column ─────────────────────────────────────────────── */}
        <div className="detail-visual-col">
          <div className="visual-panel">
            <span className="corner-mark tl" aria-hidden="true" />
            <span className="corner-mark tr" aria-hidden="true" />
            <span className="corner-mark bl" aria-hidden="true" />
            <span className="corner-mark br" aria-hidden="true" />

            {product.modelPath && (
              <div className="visual-tabs font-mono">
                <button
                  className={`visual-tab-btn ${activeTab === '3d' ? 'active' : ''}`}
                  onClick={() => setActiveTab('3d')}
                >
                  3D ARTIFACT
                </button>
                <button
                  className={`visual-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gallery')}
                >
                  IMAGES
                </button>
              </div>
            )}

            <div className="visual-content">
              {activeTab === '3d' && product.modelPath ? (
                <ProductViewer modelPath={product.modelPath} image={product.image} name={product.name} />
              ) : (
                <ProductGallery mainImage={product.image} gallery={product.gallery} productName={product.name} />
              )}
            </div>
          </div>
        </div>

        {/* ── Info Column ───────────────────────────────────────────────── */}
        <div className="detail-info-col">
          <div className="info-header">
            <div className="info-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="category-badge label">{product.category}</span>
              {product.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="tag-badge label">#{tag}</span>
              ))}
              <div style={{ marginLeft: 'auto' }}>
                <WishlistButton productId={product._id} />
              </div>
            </div>

            <h2 className="product-title font-cinzel">{product.name}</h2>
            {product.subtitle && (
              <p className="font-mono" style={{ fontSize: '0.78rem', color: 'rgba(212,168,83,0.45)', letterSpacing: '0.08em', marginBottom: '8px' }}>
                {product.subtitle}
              </p>
            )}

            {/* Rating */}
            {product.rating > 0 && (
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'rgba(212,168,83,0.5)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <span style={{ color: '#f0c875', fontSize: '0.85rem' }}>
                  {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
                </span>
                <span>{product.rating.toFixed(1)} · {product.reviewCount} REVIEWS</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <div className="price-tag font-mono">{formatPrice(product.price)}</div>
              {hasDiscount && (
                <>
                  <span className="font-mono" style={{ fontSize: '0.85rem', color: 'rgba(212,168,83,0.3)', textDecoration: 'line-through' }}>
                    {formatPrice(product.comparePrice!)}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--fire)', background: 'rgba(255,107,26,0.1)', border: '1px solid rgba(255,107,26,0.3)', padding: '2px 8px' }}>
                    SAVE {discountPct}%
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="info-divider" />

          {product.shortDescription && (
            <p className="short-desc font-trirong">{product.shortDescription}</p>
          )}

          {/* ── Color Selector ───────────────────────────────────────── */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 className="section-subtitle font-mono" style={{ marginBottom: '10px' }}>
                COLORWAY — <span style={{ color: 'rgba(212,168,83,0.6)' }}>{selectedColor}</span>
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                    style={{
                      width: '32px', height: '32px',
                      borderRadius: 0,
                      background: color.hex,
                      border: selectedColor === color.name
                        ? '2px solid var(--sand2)'
                        : '2px solid rgba(212,168,83,0.15)',
                      cursor: 'pointer',
                      position: 'relative',
                      flexShrink: 0,
                      boxShadow: selectedColor === color.name ? 'var(--glow-gold)' : 'none',
                      transition: 'all 0.15s',
                    }}
                    aria-label={color.name}
                    aria-pressed={selectedColor === color.name}
                  >
                    {selectedColor === color.name && (
                      <span style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: color.hex === '#000005' || color.hex.startsWith('#0') || color.hex.startsWith('#1') || color.hex.startsWith('#2') ? '#fff' : '#000',
                        fontSize: '0.75rem',
                      }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Size Selector ────────────────────────────────────────── */}
          {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'ONE SIZE' && (
            <div style={{ marginBottom: '20px' }}>
              <h3 className="section-subtitle font-mono" style={{ marginBottom: '10px' }}>
                SIZE — <span style={{ color: 'rgba(212,168,83,0.6)' }}>{selectedSize}</span>
              </h3>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="font-mono"
                    style={{
                      minWidth: '44px',
                      height: '38px',
                      padding: '0 10px',
                      background: selectedSize === size
                        ? 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(240,200,117,0.08))'
                        : 'transparent',
                      border: `1px solid ${selectedSize === size ? 'rgba(212,168,83,0.5)' : 'rgba(212,168,83,0.15)'}`,
                      color: selectedSize === size ? '#f0c875' : 'rgba(212,168,83,0.4)',
                      fontSize: '0.72rem',
                      letterSpacing: '0.1em',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: selectedSize === size ? 'var(--glow-gold)' : 'none',
                    }}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Quantity + Add to Cart ────────────────────────────────── */}
          <div className="info-divider" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="stock-status font-mono" style={{ fontSize: '0.72rem', letterSpacing: '0.12em' }}>
              STATUS:{' '}
              {isOutOfStock ? (
                <span className="status-out-of-stock">DEPLETED — UNAVAILABLE</span>
              ) : product.stock <= 5 ? (
                <span style={{ color: 'var(--fire)' }}>LOW STOCK [{product.stock} REMAINING]</span>
              ) : (
                <span className="status-in-stock">AVAILABLE [{product.stock} UNITS]</span>
              )}
            </div>

            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="font-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(212,168,83,0.4)' }}>QTY</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={{
                      width: 34, height: 34,
                      background: 'none',
                      border: '1px solid rgba(212,168,83,0.15)',
                      color: '#d4a853',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >−</button>
                  <div style={{
                    width: 48, height: 34,
                    borderTop: '1px solid rgba(212,168,83,0.15)',
                    borderBottom: '1px solid rgba(212,168,83,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff',
                  }}>{qty}</div>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    style={{
                      width: 34, height: 34,
                      background: 'none',
                      border: '1px solid rgba(212,168,83,0.15)',
                      color: '#d4a853',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >+</button>
                </div>
              </div>
            )}

            <button
              className={isOutOfStock ? 'btn-gold detail-cart-btn' : 'btn-fire detail-cart-btn'}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{ width: '100%', padding: '14px', fontSize: '0.85rem' }}
            >
              {isOutOfStock ? '— ARTIFACT DEPLETED —' : '⚡ ADD TO CART'}
            </button>
          </div>

          {/* ── Specifications ────────────────────────────────────────── */}
          <div className="info-divider" />

          <div className="product-desc-wrap">
            <h3 className="section-subtitle font-mono">DESCRIPTION</h3>
            <p className="long-desc font-cinzel" style={{ lineHeight: 1.7, marginBottom: '16px' }}>
              {product.description}
            </p>
            {product.longDescription && (
              <p className="font-trirong" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginTop: '12px' }}>
                {product.longDescription}
              </p>
            )}
          </div>

          {/* ── Material & Shipping ───────────────────────────────────── */}
          {(product.material || product.weight || product.shippingInfo) && (
            <>
              <div className="info-divider" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 className="section-subtitle font-mono">SPECIFICATIONS</h3>
                {product.material && (
                  <div className="font-mono" style={{ fontSize: '0.7rem', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'rgba(212,168,83,0.4)', minWidth: '80px' }}>MATERIAL</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{product.material}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="font-mono" style={{ fontSize: '0.7rem', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'rgba(212,168,83,0.4)', minWidth: '80px' }}>WEIGHT</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{product.weight}</span>
                  </div>
                )}
                {product.shippingInfo && (
                  <div className="font-mono" style={{ fontSize: '0.7rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'rgba(212,168,83,0.4)', minWidth: '80px', flexShrink: 0 }}>SHIPPING</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{product.shippingInfo}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="font-mono" style={{
          position: 'fixed', bottom: 48, left: '50%', transform: 'translateX(-50%)',
          zIndex: 999, padding: '10px 28px',
          background: 'rgba(0,0,5,0.98)', border: '1px solid #d4a853',
          color: '#f0c875', letterSpacing: '0.12em', fontSize: '0.72rem',
          boxShadow: 'var(--glow-gold)', whiteSpace: 'nowrap',
          animation: 'fadeUp 0.3s ease forwards',
        }}>
          {toast}
        </div>
      )}
    </main>
  );
}
