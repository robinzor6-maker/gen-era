'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useProductStore } from '@/stores/productStore';
import ProductCard from '@/components/store/ProductCard';
import CategoryFilter from '@/components/store/CategoryFilter';
import SearchBar from '@/components/store/SearchBar';
import Pagination from '@/components/store/Pagination';
import { useCartStore } from '@/lib/store';

export default function StorePage() {
  const {
    products,
    featuredProducts,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchFeatured,
    clearError,
  } = useProductStore();

  const cartCount = useCartStore((s) => s.cartCount);
  const setIsOpen = useCartStore((s) => s.setIsOpen);

  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  // Build query params and fetch
  const load = useCallback(
    (opts: { category?: string; q?: string; page?: number } = {}) => {
      const params: Record<string, string> = {
        page: String(opts.page ?? page),
        limit: '9',
      };
      if (opts.category ?? category) params.category = opts.category ?? category;
      if (opts.q ?? query) {
        // Use search endpoint via productsApi directly — handled inside fetchProducts
        params.q = opts.q ?? query;
      }
      fetchProducts(params);
    },
    [fetchProducts, category, query, page]
  );

  // Initial load + featured
  useEffect(() => {
    fetchFeatured();
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategory = (cat: string) => {
    setCategory(cat);
    setQuery('');
    setPage(1);
    fetchProducts({
      page: '1',
      limit: '9',
      ...(cat ? { category: cat } : {}),
    });
  };

  const handleSearch = (q: string) => {
    setQuery(q);
    setPage(1);
    if (q) {
      // Pull search results
      fetchProducts({ page: '1', limit: '9', q });
    } else {
      fetchProducts({ page: '1', limit: '9', ...(category ? { category } : {}) });
    }
  };

  const handlePage = (newPage: number) => {
    setPage(newPage);
    fetchProducts({
      page: String(newPage),
      limit: '9',
      ...(category ? { category } : {}),
      ...(query ? { q: query } : {}),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showFeatured = !category && !query && page === 1 && featuredProducts.length > 0;

  return (
    <main className="store-page">
      {/* ── Header ── */}
      <header className="store-header">
        <div className="store-header-inner">
          <Link href="/" className="back-link font-mono">← TEMPLE</Link>
          <div className="store-title-wrap">
            <span className="label store-eyebrow">GEN ERA — ARCHIVE</span>
            <h1 className="store-title font-display">THE SHOP</h1>
          </div>
          <SearchBar onSearch={handleSearch} />
          <div className="store-header-actions">
            <button className="btn-gold font-mono" style={{ fontSize: '0.75rem', padding: '6px 14px' }} onClick={() => setIsOpen(true)}>
              CART <span style={{ color: 'var(--fire)' }}>{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Category Filter ── */}
      <div className="store-filters">
        <CategoryFilter active={category} onChange={handleCategory} />
      </div>

      {/* ── Featured Strip (top of page, no filters active) ── */}
      {showFeatured && (
        <section className="featured-section" aria-label="Featured products">
          <div className="section-label">
            <span className="label">FEATURED DROPS</span>
            <span className="section-rule" aria-hidden="true" />
          </div>
          <div className="featured-grid">
            {featuredProducts.slice(0, 3).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="section-divider" aria-hidden="true" />
        </section>
      )}

      {/* ── Main Grid ── */}
      <section className="products-section" aria-label="All products">
        {query && (
          <div className="search-context label">
            RESULTS FOR <strong>&ldquo;{query}&rdquo;</strong>
            {pagination && ` — ${pagination.total} found`}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="store-error" role="alert">
            <p>{error}</p>
            <button className="btn-gold" onClick={clearError}>DISMISS</button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="products-grid" aria-busy="true">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="product-card skeleton" aria-hidden="true">
                <div className="skeleton-img" />
                <div className="skeleton-body">
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
        {!loading && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && !error && (
          <div className="store-empty">
            <span className="empty-glyph font-display">𓂀</span>
            <p className="font-cinzel">THE ARCHIVE IS SILENT</p>
            <p className="text-muted">No products match your search.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <Pagination pagination={pagination} onPageChange={handlePage} />
        )}
      </section>
    </main>
  );
}
