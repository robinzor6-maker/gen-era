import { useWishlistStore } from '@/lib/store';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function WishlistButton({ productId, className = '', size = 'md' }: WishlistButtonProps) {
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(productId));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const iconSize = size === 'sm' ? '0.9rem' : '1.1rem';

  return (
    <button
      className={`wishlist-btn ${isInWishlist ? 'active' : ''} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
      style={{
        background: isInWishlist ? 'rgba(212,168,83,0.12)' : 'rgba(0,0,5,0.7)',
        border: `1px solid ${isInWishlist ? 'rgba(212,168,83,0.5)' : 'rgba(212,168,83,0.15)'}`,
        color: isInWishlist ? '#f0c875' : 'rgba(212,168,83,0.4)',
        width: size === 'sm' ? '30px' : '36px',
        height: size === 'sm' ? '30px' : '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0,
        fontSize: iconSize,
        backdropFilter: 'blur(8px)',
      }}
    >
      {isInWishlist ? '♥' : '♡'}
    </button>
  );
}
