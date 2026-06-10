'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import AddToCartButton from '@/components/store/AddToCartButton';

interface ProductCardProps {
  product: Product;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ar-EG') + ' ج.م';
}

export default function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock === 0;

  return (
    <article className="product-card" data-category={product.category}>
      {/* Corner marks */}
      <span className="corner-mark tl" aria-hidden="true" />
      <span className="corner-mark tr" aria-hidden="true" />
      <span className="corner-mark bl" aria-hidden="true" />
      <span className="corner-mark br" aria-hidden="true" />

      {/* Image */}
      <Link
        href={`/store/${product.slug}`}
        className="card-image-link"
        aria-label={`View ${product.name}`}
      >
        <div className="card-image-wrap">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="card-image"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="card-image-placeholder">
              <span className="placeholder-glyph">𓂀</span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="card-image-overlay" aria-hidden="true">
            <span className="view-label font-mono">VIEW 3D →</span>
          </div>

          {/* Badges */}
          <div className="card-badges">
            {product.featured && (
              <span className="badge badge-featured">FEATURED</span>
            )}
            {outOfStock && (
              <span className="badge badge-sold-out">SOLD OUT</span>
            )}
            {product.modelPath && (
              <span className="badge badge-3d">3D</span>
            )}
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="card-body">
        <div className="card-meta">
          <span className="card-category label">{product.category}</span>
          {product.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="card-tag label">{tag}</span>
          ))}
        </div>

        <Link href={`/store/${product.slug}`} className="card-name-link">
          <h2 className="card-name font-cinzel">{product.name}</h2>
        </Link>

        {product.shortDescription && (
          <p className="card-desc font-trirong">{product.shortDescription}</p>
        )}

        <div className="card-footer">
          <span className="card-price font-mono">{formatPrice(product.price)}</span>
          <AddToCartButton product={product} className="card-cart-btn" />
        </div>
      </div>
    </article>
  );
}
