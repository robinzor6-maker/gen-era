import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTempleStore } from '@/stores/templeStore';
import { useCartStore } from '@/lib/store';
import ChamberScene from './ChamberScene';

function getAccent(tags: string[], name: string): string {
  const text = [...tags, name].join(' ').toLowerCase();
  if (/fire|osyron|flame|inferno|blaze/.test(text)) return '#ff6b1a';
  return '#d4a853';
}

function getEntity(tags: string[], name: string): { name: string; quote: string } {
  const text = [...tags, name].join(' ').toLowerCase();
  if (/fire|osyron|flame|inferno/.test(text)) {
    return {
      name: 'OSYRON',
      quote: '"Energy is not worn.\nIt is awakened."',
    };
  }
  return {
    name: 'ANKHRON',
    quote: '"The past does not return.\nIt reveals itself."',
  };
}

function SceneFallback({ accent }: { accent: string }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000008',
    }}>
      <div style={{
        width: 120,
        height: 120,
        border: `1px solid ${accent}44`,
        borderRadius: '50%',
        animation: 'spin 2s linear infinite',
        borderTopColor: accent,
      }} />
    </div>
  );
}

export default function ProductChamber() {
  const { selectedProduct, isChamberOpen, closeChamber, closeProduct } = useTempleStore();
  const { addToCart } = useCartStore();

  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [added, setAdded] = useState(false);

  const product = selectedProduct;

  if (!product) return null;

  const accent = getAccent(product.tags ?? [], product.name);
  const entity = getEntity(product.tags ?? [], product.name);

  const handleAddToCart = () => {
    addToCart(product, 1, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  };

  const handleReturn = () => {
    closeChamber();
    setSelectedSize(undefined);
    setSelectedColor(undefined);
    setAdded(false);
  };

  const handleLeave = () => {
    closeChamber();
    closeProduct();
    setSelectedSize(undefined);
    setSelectedColor(undefined);
    setAdded(false);
  };

  return (
    <AnimatePresence>
      {isChamberOpen && (
        <motion.div
          key="chamber"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 900,
            background: '#000008',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Scanlines */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 4px)',
          }} />

          {/* Top accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              height: 2,
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
              transformOrigin: 'left',
            }}
          />

          {/* Header bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 28px',
            borderBottom: `1px solid ${accent}1e`,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.38rem',
                letterSpacing: '0.5em',
                color: `${accent}77`,
              }}>
                GEN ERA UNIVERSE
              </span>
              <span style={{ color: `${accent}33`, fontSize: '0.5rem' }}>◈</span>
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.38rem',
                letterSpacing: '0.35em',
                color: `${accent}55`,
              }}>
                ARTIFACT CHAMBER
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleReturn}
                style={{
                  background: 'none',
                  border: `1px solid ${accent}33`,
                  color: `${accent}88`,
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.4rem',
                  letterSpacing: '0.2em',
                  padding: '5px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.borderColor = accent;
                  (e.target as HTMLElement).style.color = accent;
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.borderColor = `${accent}33`;
                  (e.target as HTMLElement).style.color = `${accent}88`;
                }}
              >
                ← RETURN TO TEMPLE
              </button>
              <button
                onClick={handleLeave}
                style={{
                  background: 'none',
                  border: `1px solid rgba(212,168,83,0.15)`,
                  color: 'rgba(212,168,83,0.3)',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.4rem',
                  letterSpacing: '0.2em',
                  padding: '5px 10px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Main content — 3D scene + product UI */}
          <div style={{
            flex: 1,
            display: 'flex',
            minHeight: 0,
          }}>
            {/* LEFT — 3D Chamber Scene */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                flex: '0 0 55%',
                position: 'relative',
                borderRight: `1px solid ${accent}18`,
              }}
            >
              <Suspense fallback={<SceneFallback accent={accent} />}>
                <ChamberScene
                  productTags={product.tags ?? []}
                  productName={product.name}
                />
              </Suspense>

              {/* Entity overlay on 3D scene */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: 28,
                  fontFamily: "'Cinzel', serif",
                  pointerEvents: 'none',
                }}
              >
                <div style={{
                  fontSize: '0.4rem',
                  letterSpacing: '0.4em',
                  color: `${accent}66`,
                  marginBottom: 6,
                }}>
                  {entity.name} SPEAKS
                </div>
                <div style={{
                  fontSize: '0.52rem',
                  color: `${accent}cc`,
                  fontStyle: 'italic',
                  letterSpacing: '0.06em',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-line',
                  textShadow: `0 0 16px ${accent}44`,
                }}>
                  {entity.quote}
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT — Product UI */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              style={{
                flex: '0 0 45%',
                overflowY: 'auto',
                padding: '32px 36px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {/* Product identity */}
              <div>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.38rem',
                  letterSpacing: '0.45em',
                  color: `${accent}66`,
                  marginBottom: 8,
                }}>
                  ARTIFACT RECORD
                </div>
                <h1 style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.9rem)',
                  letterSpacing: '0.08em',
                  color: '#f0c875',
                  textShadow: `0 0 28px ${accent}55`,
                  margin: 0,
                  lineHeight: 1.15,
                }}>
                  {product.name}
                </h1>
                {product.subtitle && (
                  <div style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '0.5rem',
                    color: 'rgba(255,255,255,0.38)',
                    letterSpacing: '0.1em',
                    marginTop: 6,
                  }}>
                    {product.subtitle}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{
                height: 1,
                background: `linear-gradient(90deg, ${accent}44, transparent)`,
              }} />

              {/* Price + stock */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: '2rem',
                  color: '#ffffff',
                  letterSpacing: '0.05em',
                }}>
                  ${product.price}
                </div>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.4rem',
                  color: product.stock > 0 ? '#4ade80' : '#ef4444',
                  letterSpacing: '0.2em',
                  padding: '4px 10px',
                  border: `1px solid ${product.stock > 0 ? '#4ade8033' : '#ef444433'}`,
                }}>
                  {product.stock > 0 ? `${product.stock} REMAINING` : 'DEPLETED'}
                </div>
              </div>

              {/* Collection + category tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.collection && (
                  <span style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '0.38rem',
                    letterSpacing: '0.2em',
                    color: `${accent}99`,
                    padding: '3px 10px',
                    border: `1px solid ${accent}22`,
                    background: `${accent}08`,
                  }}>
                    {product.collection.toUpperCase()}
                  </span>
                )}
                {(product.tags ?? []).slice(0, 3).map(tag => (
                  <span key={tag} style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '0.35rem',
                    letterSpacing: '0.15em',
                    color: 'rgba(255,255,255,0.28)',
                    padding: '3px 8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>

              {/* Description */}
              {(product.shortDescription || product.description) && (
                <p style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.5rem',
                  color: 'rgba(255,255,255,0.52)',
                  letterSpacing: '0.05em',
                  lineHeight: 1.8,
                  margin: 0,
                }}>
                  {product.shortDescription || product.description}
                </p>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '0.38rem',
                    letterSpacing: '0.35em',
                    color: `${accent}77`,
                    marginBottom: 10,
                  }}>
                    SELECT SIZE
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        style={{
                          background: selectedSize === size ? accent : 'transparent',
                          border: `1px solid ${selectedSize === size ? accent : accent + '33'}`,
                          color: selectedSize === size ? '#000' : `${accent}cc`,
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: '0.48rem',
                          letterSpacing: '0.15em',
                          padding: '7px 16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          minWidth: 52,
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
                <div>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '0.38rem',
                    letterSpacing: '0.35em',
                    color: `${accent}77`,
                    marginBottom: 10,
                  }}>
                    SELECT COLOR
                    {selectedColor && (
                      <span style={{ marginLeft: 12, color: accent, fontSize: '0.35rem' }}>
                        — {selectedColor.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {product.colors.map(c => (
                      <button
                        key={c.name}
                        title={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: c.hex ?? '#888',
                          border: selectedColor === c.name
                            ? `3px solid ${accent}`
                            : '3px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          boxShadow: selectedColor === c.name
                            ? `0 0 12px ${accent}99`
                            : 'none',
                          transition: 'all 0.2s',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Material info */}
              {(product.material || product.weight) && (
                <div style={{
                  padding: '12px 16px',
                  background: `${accent}07`,
                  border: `1px solid ${accent}1a`,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}>
                  {product.material && (
                    <div>
                      <div style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: '0.32rem',
                        letterSpacing: '0.3em',
                        color: `${accent}55`,
                        marginBottom: 4,
                      }}>MATERIAL</div>
                      <div style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '0.45rem',
                        color: 'rgba(255,255,255,0.6)',
                        letterSpacing: '0.05em',
                      }}>{product.material}</div>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <div style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: '0.32rem',
                        letterSpacing: '0.3em',
                        color: `${accent}55`,
                        marginBottom: 4,
                      }}>WEIGHT</div>
                      <div style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '0.45rem',
                        color: 'rgba(255,255,255,0.6)',
                        letterSpacing: '0.05em',
                      }}>{product.weight}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  style={{
                    width: '100%',
                    padding: '16px 0',
                    background: added
                      ? '#166534'
                      : product.stock === 0
                        ? 'rgba(80,80,80,0.25)'
                        : `linear-gradient(135deg, ${accent}bb, ${accent})`,
                    border: 'none',
                    color: added ? '#4ade80' : product.stock === 0 ? '#555' : '#000',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '0.6rem',
                    letterSpacing: '0.32em',
                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    transition: 'all 0.3s',
                  }}
                >
                  {added
                    ? '𓂀 ARTIFACT CLAIMED'
                    : product.stock === 0
                      ? 'DEPLETED'
                      : 'CLAIM ARTIFACT'}
                </motion.button>

                <button
                  onClick={handleReturn}
                  style={{
                    width: '100%',
                    padding: '11px 0',
                    background: 'transparent',
                    border: `1px solid ${accent}2a`,
                    color: `${accent}77`,
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '0.42rem',
                    letterSpacing: '0.28em',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.borderColor = `${accent}66`;
                    (e.target as HTMLElement).style.color = accent;
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.borderColor = `${accent}2a`;
                    (e.target as HTMLElement).style.color = `${accent}77`;
                  }}
                >
                  ← RETURN TO TEMPLE
                </button>
              </div>
            </motion.div>
          </div>

          {/* Bottom accent line */}
          <div style={{
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`,
            flexShrink: 0,
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
