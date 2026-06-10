import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { Product } from '@/lib/types';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export default function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const addToCart = useCartStore((s) => s.addToCart);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock === 0;

  const handleClick = () => {
    if (outOfStock || added) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <button
      id={`add-to-cart-${product.slug}`}
      onClick={handleClick}
      disabled={outOfStock}
      className={`add-to-cart-btn ${outOfStock ? 'out-of-stock' : ''} ${added ? 'added' : ''} ${className}`}
      aria-label={outOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
    >
      <span className="btn-text">
        {outOfStock ? '— OUT OF STOCK —' : added ? '✓ ADDED' : 'ADD TO CART'}
      </span>
      {!outOfStock && !added && (
        <span className="btn-shine" aria-hidden="true" />
      )}
    </button>
  );
}
