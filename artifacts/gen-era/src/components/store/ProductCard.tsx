import { Link } from 'wouter';
import { Product } from '@/lib/types';
import AddToCartButton from '@/components/store/AddToCartButton';
import WishlistButton from '@/components/store/WishlistButton';

interface ProductCardProps {
  product: Product;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ar-EG') + ' ج.م';
}

export default function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock === 0;
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice!) * 100)
    : 0;

  return (
    <article className="product-card" data-category={product.category}>
      <span className="corner-mark tl" aria-hidden="true" />
      <span className="corner-mark tr" aria-hidden="true" />
      <span className="corner-mark bl" aria-hidden="true" />
      <span className="corner-mark br" aria-hidden="true" />

      <Link
        href={`/store/${product.slug}`}
        className="card-image-link"
        aria-label={`View ${product.name}`}
      >
        <div className="card-image-wrap">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="card-image"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="card-image-placeholder">
              <span className="placeholder-glyph">𓂀</span>
            </div>
          )}

          <div className="card-image-overlay" aria-hidden="true">
            <span className="view-label font-mono">VIEW SPEC →</span>
          </div>

          <div className="card-badges">
            {product.featured && (
              <span className="badge badge-featured">FEATURED</span>
            )}
            {outOfStock && (
              <span className="badge badge-sold-out">SOLD OUT</span>
            )}
            {hasDiscount && !outOfStock && (
              <span className="badge" style={{ background: 'rgba(255,107,26,0.85)', color: '#fff', border: 'none', fontSize: '0.62rem' }}>
                −{discountPct}%
              </span>
            )}
            {product.modelPath && (
              <span className="badge badge-3d">3D</span>
            )}
          </div>

          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
            <WishlistButton productId={product._id} size="sm" />
          </div>
        </div>
      </Link>

      <div className="card-body">
        <div className="card-meta">
          <span className="card-category label">{product.category}</span>
          {product.collection && (
            <span className="card-tag label" style={{ color: 'rgba(255,107,26,0.6)', borderColor: 'rgba(255,107,26,0.2)' }}>
              {product.collection.replace(/-/g, ' ').toUpperCase()}
            </span>
          )}
        </div>

        <Link href={`/store/${product.slug}`} className="card-name-link">
          <h2 className="card-name font-cinzel">{product.name}</h2>
        </Link>

        {product.subtitle && (
          <p className="font-mono" style={{ fontSize: '0.68rem', color: 'rgba(212,168,83,0.4)', letterSpacing: '0.06em', marginBottom: '6px' }}>
            {product.subtitle}
          </p>
        )}

        {product.shortDescription && (
          <p className="card-desc font-trirong">{product.shortDescription}</p>
        )}

        {product.rating > 0 && (
          <div className="font-mono" style={{ fontSize: '0.65rem', color: 'rgba(212,168,83,0.5)', letterSpacing: '0.05em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#f0c875' }}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
            <span>({product.reviewCount})</span>
          </div>
        )}

        <div className="card-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="card-price font-mono">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="font-mono" style={{ fontSize: '0.65rem', color: 'rgba(212,168,83,0.3)', textDecoration: 'line-through' }}>
                {formatPrice(product.comparePrice!)}
              </span>
            )}
          </div>
          <AddToCartButton product={product} className="card-cart-btn" />
        </div>
      </div>
    </article>
  );
}
