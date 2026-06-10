'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProductStore } from '@/stores/productStore';
import ProductViewer from '@/components/store/ProductViewer';
import ProductGallery from '@/components/store/ProductGallery';
import AddToCartButton from '@/components/store/AddToCartButton';
import { useCartStore } from '@/lib/store';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ar-EG') + ' ج.م';
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = React.use(params);
  const {
    selectedProduct: product,
    loading,
    error,
    fetchProduct,
    clearSelection,
  } = useProductStore();

  const cartCount = useCartStore((s) => s.cartCount);
  const setIsOpen = useCartStore((s) => s.setIsOpen);

  const [activeTab, setActiveTab] = useState<'3d' | 'gallery'>('gallery');

  useEffect(() => {
    fetchProduct(slug);
    return () => {
      clearSelection();
    };
  }, [slug, fetchProduct, clearSelection]);

  // Set default tab to '3d' if product has modelPath
  useEffect(() => {
    if (product?.modelPath) {
      setActiveTab('3d');
    } else {
      setActiveTab('gallery');
    }
  }, [product]);

  if (loading) {
    return (
      <main className="product-detail-page detail-loading-page">
        <header className="store-header">
          <div className="store-header-inner">
            <Link href="/store" className="back-link font-mono">
              ← BACK TO ARCHIVE
            </Link>
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
            <Link href="/store" className="back-link font-mono">
              ← BACK TO ARCHIVE
            </Link>
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

  return (
    <main className="product-detail-page animate-fade-up">
      <header className="store-header">
        <div className="store-header-inner">
          <Link href="/store" className="back-link font-mono">
            ← BACK TO ARCHIVE
          </Link>
          <div className="store-title-wrap">
            <span className="label store-eyebrow">GEN ERA — PRODUCT SPECIFICATION</span>
            <h1 className="store-title font-display">{product.name}</h1>
          </div>
          <button className="btn-gold font-mono" style={{ fontSize: '0.75rem', padding: '6px 14px' }} onClick={() => setIsOpen(true)}>
            CART <span style={{ color: 'var(--fire)' }}>{cartCount}</span>
          </button>
        </div>
      </header>

      <div className="detail-container">
        {/* Left Column — Visualizer / Gallery */}
        <div className="detail-visual-col">
          <div className="visual-panel">
            <span className="corner-mark tl" aria-hidden="true" />
            <span className="corner-mark tr" aria-hidden="true" />
            <span className="corner-mark bl" aria-hidden="true" />
            <span className="corner-mark br" aria-hidden="true" />

            {/* Tabs for switching between 3D Viewer & Image Gallery */}
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
                <ProductViewer
                  modelPath={product.modelPath}
                  image={product.image}
                  name={product.name}
                />
              ) : (
                <ProductGallery
                  mainImage={product.image}
                  gallery={product.gallery}
                  productName={product.name}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column — Information & Add to Cart */}
        <div className="detail-info-col">
          <div className="info-header">
            <div className="info-meta">
              <span className="category-badge label">{product.category}</span>
              {product.tags.map((tag) => (
                <span key={tag} className="tag-badge label">
                  #{tag}
                </span>
              ))}
            </div>
            <h2 className="product-title font-cinzel">{product.name}</h2>
            <div className="price-tag font-mono">{formatPrice(product.price)}</div>
          </div>

          <div className="info-divider" />

          {product.shortDescription && (
            <p className="short-desc font-trirong">{product.shortDescription}</p>
          )}

          <div className="product-desc-wrap">
            <h3 className="section-subtitle font-mono">SPECIFICATIONS</h3>
            <p className="long-desc font-cinzel">{product.description}</p>
          </div>

          <div className="info-divider" />

          <div className="detail-purchase-row">
            <div className="stock-status font-mono">
              STATUS:{' '}
              {product.stock > 0 ? (
                <span className="status-in-stock">AVAILABLE [{product.stock}]</span>
              ) : (
                <span className="status-out-of-stock">DEPLETED</span>
              )}
            </div>
            <AddToCartButton product={product} className="detail-cart-btn btn-fire" />
          </div>
        </div>
      </div>
    </main>
  );
}
