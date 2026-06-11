import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTempleStore } from '@/stores/templeStore';
import { useCartStore } from '@/lib/store';

function getAccentColor(tags: string[], name: string): string {
  const text = [...tags, name].join(' ').toLowerCase();
  if (/fire|osyron|flame|inferno/.test(text)) return '#ff6b1a';
  return '#d4a853';
}

function getLoreText(tags: string[], name: string): string {
  const text = [...tags, name].join(' ').toLowerCase();
  if (/fire|osyron|flame/.test(text)) {
    return '"Forged within the Flame Protocol of OSYRON"';
  }
  return '"This artifact belongs to the Archive of ANKHRON"';
}

export default function ProductInfoPanel() {
  const { selectedProduct, isPanelOpen, closeProduct } = useTempleStore();
  const { addToCart } = useCartStore();

  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [added, setAdded] = useState(false);

  const product = selectedProduct;

  const accent = product
    ? getAccentColor(product.tags ?? [], product.name)
    : '#d4a853';
  const lore = product
    ? getLoreText(product.tags ?? [], product.name)
    : '';

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleClose = () => {
    closeProduct();
    setSelectedSize(undefined);
    setSelectedColor(undefined);
    setAdded(false);
  };

  return (
    <AnimatePresence>
      {isPanelOpen && product && (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: '50%',
            right: 24,
            transform: 'translateY(-50%)',
            zIndex: 600,
            width: 'min(340px, 90vw)',
            background: 'rgba(3,2,10,0.97)',
            border: `1px solid ${accent}44`,
            backdropFilter: 'blur(24px)',
            padding: '24px 24px 20px',
            fontFamily: "'Cinzel', serif",
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }}
          />

          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.38rem',
                  letterSpacing: '0.45em',
                  color: accent,
                  opacity: 0.65,
                  marginBottom: 5,
                }}
              >
                ARTIFACT EXAMINATION
              </div>
              <div
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: '1.05rem',
                  letterSpacing: '0.1em',
                  color: '#f0c875',
                  textShadow: `0 0 16px ${accent}66`,
                  lineHeight: 1.2,
                }}
              >
                {product.name}
              </div>
              {product.subtitle && (
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '0.5rem',
                    color: 'rgba(255,255,255,0.38)',
                    letterSpacing: '0.1em',
                    marginTop: 3,
                  }}
                >
                  {product.subtitle}
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: `1px solid rgba(212,168,83,0.18)`,
                color: 'rgba(212,168,83,0.45)',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.5rem',
                letterSpacing: '0.2em',
                padding: '4px 10px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg, transparent, ${accent}33, transparent)`,
              marginBottom: 14,
            }}
          />

          {/* Product image */}
          {product.image && (
            <div
              style={{
                width: '100%',
                height: 160,
                marginBottom: 14,
                overflow: 'hidden',
                position: 'relative',
                border: `1px solid ${accent}22`,
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.88) contrast(1.05)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(to top, rgba(3,2,10,0.7) 0%, transparent 60%)`,
                }}
              />
            </div>
          )}

          {/* Lore text */}
          <div
            style={{
              padding: '8px 12px',
              background: `${accent}09`,
              border: `1px solid ${accent}1e`,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.44rem',
                color: `${accent}bb`,
                letterSpacing: '0.07em',
                fontStyle: 'italic',
                lineHeight: 1.6,
              }}
            >
              {lore}
            </span>
          </div>

          {/* Price + Stock */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: '1.35rem',
                color: '#ffffff',
                letterSpacing: '0.05em',
              }}
            >
              ${product.price}
            </div>
            <div
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.4rem',
                color: product.stock > 0 ? '#4ade80' : '#ef4444',
                letterSpacing: '0.2em',
                padding: '3px 8px',
                border: `1px solid ${product.stock > 0 ? '#4ade8044' : '#ef444444'}`,
              }}
            >
              {product.stock > 0 ? `IN STOCK — ${product.stock}` : 'OUT OF STOCK'}
            </div>
          </div>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.38rem',
                  letterSpacing: '0.35em',
                  color: `${accent}88`,
                  marginBottom: 7,
                }}
              >
                SIZE
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      background: selectedSize === size ? accent : 'transparent',
                      border: `1px solid ${selectedSize === size ? accent : accent + '44'}`,
                      color: selectedSize === size ? '#000' : `${accent}cc`,
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: '0.45rem',
                      letterSpacing: '0.15em',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.38rem',
                  letterSpacing: '0.35em',
                  color: `${accent}88`,
                  marginBottom: 7,
                }}
              >
                COLOR
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    title={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: c.hex ?? '#888',
                      border: selectedColor === c.name
                        ? `2px solid ${accent}`
                        : '2px solid rgba(255,255,255,0.15)',
                      cursor: 'pointer',
                      boxShadow:
                        selectedColor === c.name
                          ? `0 0 8px ${accent}`
                          : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Short description */}
          {product.shortDescription && (
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.46rem',
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.06em',
                lineHeight: 1.7,
                marginBottom: 16,
              }}
            >
              {product.shortDescription}
            </p>
          )}

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{
              width: '100%',
              padding: '13px 0',
              background: added
                ? '#166534'
                : product.stock === 0
                  ? 'rgba(80,80,80,0.3)'
                  : `linear-gradient(135deg, ${accent}cc, ${accent})`,
              border: 'none',
              color: added ? '#4ade80' : product.stock === 0 ? '#555' : '#000',
              fontFamily: "'Cinzel', serif",
              fontSize: '0.55rem',
              letterSpacing: '0.3em',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {added
              ? '✓ ADDED TO CART'
              : product.stock === 0
                ? 'DEPLETED'
                : 'CLAIM ARTIFACT'}
          </button>

          {/* View full detail link */}
          <a
            href={`/store/${product.slug}`}
            style={{
              display: 'block',
              textAlign: 'center',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.4rem',
              letterSpacing: '0.25em',
              color: `${accent}66`,
              textDecoration: 'none',
              padding: '6px 0',
              border: `1px solid ${accent}22`,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = accent)
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = `${accent}66`)
            }
          >
            FULL ARTIFACT RECORD →
          </a>

          {/* Bottom accent */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
