import { useEffect, useState, useCallback } from 'react';
import { Link } from 'wouter';
import { useProductStore } from '@/stores/productStore';
import { useCartStore } from '@/lib/store';
import { Collection } from '@/lib/types';
import { api } from '@/lib/api';
import ProductCard from '@/components/store/ProductCard';
import CategoryFilter from '@/components/store/CategoryFilter';
import SearchBar from '@/components/store/SearchBar';
import Pagination from '@/components/store/Pagination';

const PRICE_MAX = 5000;

function PriceSlider({ min, max, onChange }: {
  min: number; max: number;
  onChange: (min: number, max: number) => void;
}) {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  function commit(newMin: number, newMax: number) {
    setLocalMin(newMin);
    setLocalMax(newMax);
    onChange(newMin, newMax);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
      <div className="font-mono" style={{ fontSize: '0.62rem', letterSpacing: '0.15em', color: 'rgba(212,168,83,0.4)' }}>
        PRICE: ج.م {localMin.toLocaleString()} – ج.م {localMax === PRICE_MAX ? `${PRICE_MAX.toLocaleString()}+` : localMax.toLocaleString()}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="range" min={0} max={PRICE_MAX} step={100}
          value={localMin}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), localMax - 100);
            commit(v, localMax);
          }}
          style={{ flex: 1, accentColor: 'var(--fire)', height: 2 }}
        />
        <input
          type="range" min={0} max={PRICE_MAX} step={100}
          value={localMax}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), localMin + 100);
            commit(localMin, v);
          }}
          style={{ flex: 1, accentColor: 'var(--sand)', height: 2 }}
        />
        {(localMin > 0 || localMax < PRICE_MAX) && (
          <button
            onClick={() => commit(0, PRICE_MAX)}
            className="font-mono"
            style={{ fontSize: '0.58rem', color: 'rgba(212,168,83,0.4)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}
          >✕</button>
        )}
      </div>
    </div>
  );
}

export default function StorePage() {
  const {
    products, featuredProducts, loading, error, pagination,
    fetchProducts, fetchFeatured, clearError,
  } = useProductStore();

  const cartCount = useCartStore((s) => s.cartCount);
  const setIsOpen = useCartStore((s) => s.setIsOpen);

  const [category,   setCategory]   = useState('');
  const [collection, setCollection] = useState('');
  const [query,      setQuery]      = useState('');
  const [page,       setPage]       = useState(1);
  const [minPrice,   setMinPrice]   = useState(0);
  const [maxPrice,   setMaxPrice]   = useState(PRICE_MAX);
  const [inStock,    setInStock]    = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    fetchFeatured();
    fetchProducts({ page: '1', limit: '9' });
    api.get<{ success: boolean; data: Collection[] }>('/collections')
      .then((r) => setCollections(r.data))
      .catch(() => {});
  }, [fetchFeatured, fetchProducts]);

  const buildParams = useCallback((overrides: Record<string, string> = {}): Record<string, string> => {
    const p: Record<string, string> = {
      page: String(page),
      limit: '9',
      ...overrides,
    };
    if (category)   p.category   = category;
    if (collection) p.collection = collection;
    if (query)      p.q          = query;
    if (minPrice > 0)             p.minPrice = String(minPrice);
    if (maxPrice < PRICE_MAX)     p.maxPrice = String(maxPrice);
    if (inStock)                  p.inStock  = 'true';
    return p;
  }, [category, collection, query, page, minPrice, maxPrice, inStock]);

  function applyFilters(overrides: Record<string, string> = {}) {
    const params = buildParams({ page: '1', ...overrides });
    setPage(1);
    fetchProducts(params);
  }

  const handleCategory = (cat: string) => {
    setCategory(cat);
    setCollection('');
    applyFilters({ category: cat, collection: '' });
  };

  const handleCollection = (slug: string) => {
    setCollection(slug);
    applyFilters({ collection: slug });
  };

  const handleSearch = (q: string) => {
    setQuery(q);
    applyFilters({ q });
  };

  const handlePrice = (newMin: number, newMax: number) => {
    setMinPrice(newMin);
    setMaxPrice(newMax);
    const extra: Record<string, string> = {};
    if (newMin > 0)          extra.minPrice = String(newMin);
    if (newMax < PRICE_MAX)  extra.maxPrice = String(newMax);
    fetchProducts(buildParams({ page: '1', ...extra }));
    setPage(1);
  };

  const handleInStock = (v: boolean) => {
    setInStock(v);
    const extra: Record<string, string> = {};
    if (v) extra.inStock = 'true';
    fetchProducts(buildParams({ page: '1', inStock: v ? 'true' : '' }));
    setPage(1);
  };

  const handlePage = (newPage: number) => {
    setPage(newPage);
    fetchProducts(buildParams({ page: String(newPage) }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showFeatured = !category && !collection && !query && page === 1 &&
    minPrice === 0 && maxPrice === PRICE_MAX && !inStock && featuredProducts.length > 0;

  const activeFilterCount = [
    category, collection, query,
    minPrice > 0 ? 'p' : '', maxPrice < PRICE_MAX ? 'p' : '',
    inStock ? 's' : '',
  ].filter(Boolean).length;

  function clearAll() {
    setCategory(''); setCollection(''); setQuery('');
    setMinPrice(0); setMaxPrice(PRICE_MAX); setInStock(false);
    fetchProducts({ page: '1', limit: '9' });
    setPage(1);
  }

  return (
    <main className="store-page">
      <header className="store-header">
        <div className="store-header-inner">
          <Link href="/" className="back-link font-mono">← TEMPLE</Link>
          <div className="store-title-wrap">
            <span className="label store-eyebrow">GEN ERA — ARCHIVE</span>
            <h1 className="store-title font-display">THE SHOP</h1>
          </div>
          <SearchBar onSearch={handleSearch} />
          <div className="store-header-actions">
            <Link href="/wishlist" className="font-mono" style={{ fontSize: '0.72rem', color: 'rgba(212,168,83,0.5)', textDecoration: 'none', letterSpacing: '0.1em' }}>♡ SAVED</Link>
            <button className="btn-gold font-mono" style={{ fontSize: '0.75rem', padding: '6px 14px' }} onClick={() => setIsOpen(true)}>
              CART <span style={{ color: 'var(--fire)' }}>{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Category Filter Row ─────────────────────────────────────────── */}
      <div className="store-filters">
        <CategoryFilter active={category} onChange={handleCategory} />
      </div>

      {/* ── Extended Filters ────────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid rgba(212,168,83,0.07)',
        background: 'rgba(0,0,5,0.6)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '12px 24px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>

          {/* Collection chips */}
          {collections.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.2em', color: 'rgba(212,168,83,0.3)', marginRight: 4 }}>COLLECTION</span>
              <button
                onClick={() => handleCollection('')}
                className="font-mono"
                style={{
                  fontSize: '0.62rem', letterSpacing: '0.1em', padding: '4px 10px',
                  background: !collection ? 'rgba(212,168,83,0.1)' : 'none',
                  border: `1px solid ${!collection ? 'rgba(212,168,83,0.35)' : 'rgba(212,168,83,0.1)'}`,
                  color: !collection ? '#f0c875' : 'rgba(212,168,83,0.4)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >ALL</button>
              {collections.map((col) => (
                <button
                  key={col.slug}
                  onClick={() => handleCollection(col.slug)}
                  className="font-mono"
                  style={{
                    fontSize: '0.62rem', letterSpacing: '0.08em', padding: '4px 10px',
                    background: collection === col.slug ? 'rgba(255,107,26,0.1)' : 'none',
                    border: `1px solid ${collection === col.slug ? 'rgba(255,107,26,0.4)' : 'rgba(212,168,83,0.1)'}`,
                    color: collection === col.slug ? 'var(--fire)' : 'rgba(212,168,83,0.4)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <span style={{ fontSize: '0.8rem' }}>{col.coverGlyph}</span>
                  {col.name}
                  {col.productCount > 0 && (
                    <span style={{ opacity: 0.5 }}>({col.productCount})</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Price range */}
          <PriceSlider
            min={minPrice}
            max={maxPrice}
            onChange={handlePrice}
          />

          {/* In-stock toggle */}
          <button
            onClick={() => handleInStock(!inStock)}
            className="font-mono"
            style={{
              fontSize: '0.62rem', letterSpacing: '0.1em', padding: '4px 12px',
              background: inStock ? 'rgba(0,255,136,0.08)' : 'none',
              border: `1px solid ${inStock ? 'rgba(0,255,136,0.3)' : 'rgba(212,168,83,0.1)'}`,
              color: inStock ? 'rgba(0,255,136,0.8)' : 'rgba(212,168,83,0.4)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {inStock ? '● ' : '○ '}IN STOCK ONLY
          </button>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="font-mono"
              style={{
                fontSize: '0.6rem', letterSpacing: '0.12em', padding: '4px 10px',
                background: 'none', border: '1px solid rgba(212,168,83,0.1)',
                color: 'rgba(212,168,83,0.35)', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              CLEAR {activeFilterCount} FILTER{activeFilterCount > 1 ? 'S' : ''} ✕
            </button>
          )}
        </div>
      </div>

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

      <section className="products-section" aria-label="All products">
        {(query || collection) && (
          <div className="search-context label" style={{ padding: '12px 24px' }}>
            {query && <>RESULTS FOR <strong>&ldquo;{query}&rdquo;</strong></>}
            {collection && !query && <>COLLECTION: <strong style={{ color: 'var(--fire)' }}>{collections.find(c => c.slug === collection)?.name || collection.replace(/-/g, ' ').toUpperCase()}</strong></>}
            {pagination && ` — ${pagination.total} artifact${pagination.total !== 1 ? 's' : ''}`}
          </div>
        )}

        {error && (
          <div className="store-error" role="alert">
            <p>{error}</p>
            <button className="btn-gold" onClick={clearError}>DISMISS</button>
          </div>
        )}

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

        {!loading && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && !error && (
          <div className="store-empty">
            <span className="empty-glyph font-display">𓂀</span>
            <p className="font-cinzel">THE ARCHIVE IS SILENT</p>
            <p className="text-muted">No artifacts match your filters.</p>
            {activeFilterCount > 0 && (
              <button className="btn-gold" onClick={clearAll} style={{ marginTop: 16, padding: '8px 20px' }}>
                CLEAR FILTERS
              </button>
            )}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <Pagination pagination={pagination} onPageChange={handlePage} />
        )}
      </section>
    </main>
  );
}
