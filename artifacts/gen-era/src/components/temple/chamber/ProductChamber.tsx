import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTempleStore } from '@/stores/templeStore';
import { useCartStore } from '@/lib/store';
import ChamberScene from './ChamberScene';
import ClaimCeremony from '@/components/temple/effects/ClaimCeremony';
import EntityEntrance from '@/components/entities/EntityEntrance';
import EntityDialogue from '@/components/entities/EntityDialogue';
import EntityVoiceLines from '@/components/entities/EntityVoiceLines';
import { getEntityDialogueLines } from '@/components/entities/useEntityDialogue';
import { getDistrict, getRarity, RARITY_COLORS, DISTRICT_COLORS, generateLore } from '@/lib/lore/generateLore';
import { api } from '@/lib/api';

function SceneFallback({ accent }: { accent: string }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000008',
    }}>
      <div style={{
        width: 110, height: 110,
        border: `1px solid ${accent}44`,
        borderRadius: '50%',
        animation: 'spin 2s linear infinite',
        borderTopColor: accent,
      }} />
    </div>
  );
}

export default function ProductChamber() {
  const {
    selectedProduct, isChamberOpen, closeChamber, closeProduct,
    isCeremonyActive, startCeremony, endCeremony,
  } = useTempleStore();
  const { addToCart } = useCartStore();

  const [selectedSize,  setSelectedSize]  = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [added, setAdded] = useState(false);

  // Entity activation state
  const [entranceActive,  setEntranceActive]  = useState(false);
  const [entityVisible,   setEntityVisible]   = useState(false);
  const [entityOpacity,   setEntityOpacity]   = useState(0);
  const [dialogueVisible, setDialogueVisible] = useState(false);
  const prevChamberOpen = useRef(false);

  const product = selectedProduct;

  const district    = product ? getDistrict(product)    : 'gencore' as const;
  const rarity      = product ? getRarity(product)      : 'rare'    as const;
  const rarityColor = RARITY_COLORS[rarity];
  const accent      = DISTRICT_COLORS[district].primary;
  const loreText    = product ? generateLore(product)   : '';

  const entityName  = district === 'ankhron' ? 'ANKHRON'
    : district === 'osyron' ? 'OSYRON' : 'GEN ERA';

  const hasEntity   = district === 'ankhron' || district === 'osyron';
  const dialogueLines = product && hasEntity ? getEntityDialogueLines(product, district, rarity) : [];

  // Trigger entrance when chamber opens
  useEffect(() => {
    if (isChamberOpen && !prevChamberOpen.current) {
      setEntityVisible(false);
      setEntityOpacity(0);
      setDialogueVisible(false);
      if (hasEntity) {
        setEntranceActive(true);
      }
    }
    if (!isChamberOpen) {
      setEntranceActive(false);
      setEntityVisible(false);
      setEntityOpacity(0);
      setDialogueVisible(false);
    }
    prevChamberOpen.current = isChamberOpen;
  }, [isChamberOpen, hasEntity]);

  const handleEntityShow = useCallback(() => {
    setEntityVisible(true);
    // Fade entity opacity in
    let op = 0;
    const interval = setInterval(() => {
      op = Math.min(op + 0.04, 1);
      setEntityOpacity(op);
      if (op >= 1) clearInterval(interval);
    }, 40);
  }, []);

  const handleEntranceComplete = useCallback(() => {
    setEntranceActive(false);
    setDialogueVisible(true);
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1, selectedSize, selectedColor);
    setAdded(true);
    startCeremony(product.name, accent);

    api.post('/analytics/claim', {
      artifactId:   product._id,
      artifactName: product.name,
      collection:   product.collection ?? '',
      district,
      priceCents:   Math.round(product.price * 100),
      converted:    true,
    }).catch(() => {});
  };

  const handleCeremonyComplete = () => {
    endCeremony();
    setTimeout(() => setAdded(false), 800);
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

  if (!product) return null;

  return (
    <>
      {/* ─── Ambient entity voice (ready for audio files) ────────────────── */}
      <EntityVoiceLines
        play={dialogueVisible && hasEntity}
        volume={0.45}
        fadeInMs={1200}
        fadeOutMs={700}
      />

      {/* ─── Claim Ceremony overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {isCeremonyActive && (
          <ClaimCeremony
            accent={accent}
            productName={product.name}
            onComplete={handleCeremonyComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChamberOpen && (
          <motion.div
            key="chamber"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 900,
              background: '#000008',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Scanlines */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.012) 3px, rgba(0,0,0,0.012) 4px)',
            }} />

            {/* Top accent line */}
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.55 }}
              style={{
                height: 2,
                background: `linear-gradient(90deg, transparent, ${accent}, ${rarityColor}, ${accent}, transparent)`,
                transformOrigin: 'left',
                flexShrink: 0,
              }}
            />

            {/* Header bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 24px',
              borderBottom: `1px solid ${accent}1a`,
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.38rem', letterSpacing: '0.5em', color: `${accent}66`,
                }}>GEN ERA UNIVERSE</span>
                <span style={{ color: `${accent}33`, fontSize: '0.5rem' }}>◈</span>
                <span style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.38rem', letterSpacing: '0.35em', color: `${accent}44`,
                }}>ARTIFACT CHAMBER</span>
                {rarity !== 'rare' && (
                  <>
                    <span style={{ color: `${rarityColor}33`, fontSize: '0.5rem' }}>◈</span>
                    <span style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: '0.36rem', letterSpacing: '0.25em',
                      color: rarityColor, textShadow: `0 0 8px ${rarityColor}66`,
                    }}>{rarity.toUpperCase()}</span>
                  </>
                )}
                {hasEntity && (
                  <>
                    <span style={{ color: `${accent}22`, fontSize: '0.5rem' }}>◈</span>
                    <motion.span
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: '0.35rem', letterSpacing: '0.25em',
                        color: `${accent}66`,
                      }}
                    >{entityName} PRESENT</motion.span>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleReturn}
                  style={{
                    background: 'none', border: `1px solid ${accent}30`, color: `${accent}77`,
                    fontFamily: "'Share Tech Mono', monospace", fontSize: '0.38rem',
                    letterSpacing: '0.2em', padding: '5px 14px', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = accent; (e.target as HTMLElement).style.color = accent; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = `${accent}30`; (e.target as HTMLElement).style.color = `${accent}77`; }}
                >← RETURN</button>
                <button onClick={handleLeave}
                  style={{
                    background: 'none', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.2)', fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '0.38rem', letterSpacing: '0.2em', padding: '5px 10px', cursor: 'pointer',
                  }}
                >✕</button>
              </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              {/* LEFT — 3D Chamber Scene */}
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18, duration: 0.45 }}
                style={{
                  flex: '0 0 55%', position: 'relative',
                  borderRight: `1px solid ${accent}14`,
                }}
              >
                {/* Entity entrance overlay (inside the 3D panel) */}
                {hasEntity && (
                  <EntityEntrance
                    district={district as 'ankhron' | 'osyron'}
                    accent={accent}
                    entityName={entityName}
                    active={entranceActive}
                    onEntityShow={handleEntityShow}
                    onComplete={handleEntranceComplete}
                  />
                )}

                {/* 3D Chamber Scene */}
                <ChamberScene
                  productTags={product.tags ?? []}
                  productName={product.name}
                  district={district}
                  rarity={rarity}
                  entityVisible={entityVisible}
                  entityOpacity={entityOpacity}
                />

                {/* Entity dialogue — typewriter (HTML overlay) */}
                {hasEntity && (
                  <EntityDialogue
                    lines={dialogueLines}
                    accent={accent}
                    entityName={entityName}
                    visible={dialogueVisible}
                  />
                )}

                {/* Rarity badge */}
                {rarity !== 'rare' && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: hasEntity ? 6.5 : 1.2 }}
                    style={{
                      position: 'absolute', top: 16, left: 16, pointerEvents: 'none',
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: '0.36rem', letterSpacing: '0.3em',
                      color: rarityColor, textShadow: `0 0 12px ${rarityColor}`,
                      zIndex: 15,
                    }}
                  >◈ {rarity.toUpperCase()} CLASS ARTIFACT</motion.div>
                )}
              </motion.div>

              {/* RIGHT — Product UI */}
              <motion.div
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22, duration: 0.45 }}
                style={{
                  flex: '0 0 45%', overflowY: 'auto',
                  padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 18,
                }}
              >
                {/* Identity */}
                <div>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '0.36rem', letterSpacing: '0.45em',
                    color: `${accent}55`, marginBottom: 6,
                  }}>ARTIFACT RECORD</div>
                  <h1 style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    fontSize: 'clamp(1.1rem, 2.4vw, 1.8rem)',
                    letterSpacing: '0.08em', color: '#f0c875',
                    textShadow: `0 0 28px ${accent}55`, margin: 0, lineHeight: 1.15,
                  }}>{product.name}</h1>
                  {product.subtitle && (
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: '0.48rem',
                      color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginTop: 5,
                    }}>{product.subtitle}</div>
                  )}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: `linear-gradient(90deg, ${accent}55, ${rarityColor}33, transparent)` }} />

                {/* Price + stock */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    fontFamily: "'Cinzel Decorative', serif", fontSize: '1.9rem',
                    color: '#fff', letterSpacing: '0.05em',
                  }}>${product.price}</div>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace", fontSize: '0.38rem',
                    color: product.stock > 0 ? '#4ade80' : '#ef4444', letterSpacing: '0.2em',
                    padding: '4px 10px', border: `1px solid ${product.stock > 0 ? '#4ade8030' : '#ef444430'}`,
                  }}>
                    {product.stock > 0 ? `${product.stock} REMAINING` : 'DEPLETED'}
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'Share Tech Mono', monospace", fontSize: '0.36rem',
                    letterSpacing: '0.2em', color: `${accent}88`,
                    padding: '3px 10px', border: `1px solid ${accent}22`, background: `${accent}08`,
                  }}>{DISTRICT_COLORS[district].label}</span>
                  {(product.tags ?? []).slice(0, 3).map(tag => (
                    <span key={tag} style={{
                      fontFamily: "'Share Tech Mono', monospace", fontSize: '0.33rem',
                      letterSpacing: '0.14em', color: 'rgba(255,255,255,0.26)',
                      padding: '3px 8px', border: '1px solid rgba(255,255,255,0.07)',
                    }}>{tag.toUpperCase()}</span>
                  ))}
                </div>

                {/* Lore text */}
                <div style={{
                  padding: '12px 14px', background: `${accent}07`,
                  border: `1px solid ${accent}18`,
                }}>
                  {loreText.split('\n\n').map((paragraph, i) => (
                    <p key={i} style={{
                      fontFamily: "'Cinzel', serif", fontSize: '0.44rem',
                      color: i === 0 ? `${accent}bb` : `${accent}77`,
                      letterSpacing: '0.04em', lineHeight: 1.75,
                      fontStyle: 'italic', margin: i > 0 ? '8px 0 0' : 0,
                    }}>{paragraph}</p>
                  ))}
                </div>

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div style={{
                      fontFamily: "'Share Tech Mono', monospace", fontSize: '0.36rem',
                      letterSpacing: '0.35em', color: `${accent}66`, marginBottom: 9,
                    }}>SELECT SIZE</div>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      {product.sizes.map(size => (
                        <button key={size} onClick={() => setSelectedSize(size)} style={{
                          background: selectedSize === size ? accent : 'transparent',
                          border: `1px solid ${selectedSize === size ? accent : accent + '33'}`,
                          color: selectedSize === size ? '#000' : `${accent}cc`,
                          fontFamily: "'Share Tech Mono', monospace", fontSize: '0.46rem',
                          letterSpacing: '0.15em', padding: '7px 15px',
                          cursor: 'pointer', transition: 'all 0.2s', minWidth: 50,
                        }}>{size}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <div style={{
                      fontFamily: "'Share Tech Mono', monospace", fontSize: '0.36rem',
                      letterSpacing: '0.35em', color: `${accent}66`, marginBottom: 9,
                    }}>
                      SELECT COLOR
                      {selectedColor && <span style={{ marginLeft: 12, color: accent, fontSize: '0.33rem' }}>— {selectedColor.toUpperCase()}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                      {product.colors.map(c => (
                        <button key={c.name} title={c.name} onClick={() => setSelectedColor(c.name)} style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: c.hex ?? '#888',
                          border: selectedColor === c.name ? `3px solid ${accent}` : '3px solid rgba(255,255,255,0.08)',
                          cursor: 'pointer',
                          boxShadow: selectedColor === c.name ? `0 0 12px ${accent}88` : 'none',
                          transition: 'all 0.2s',
                        }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Material info */}
                {(product.material || product.weight) && (
                  <div style={{
                    padding: '11px 14px', background: `${accent}06`,
                    border: `1px solid ${accent}15`,
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                  }}>
                    {product.material && (
                      <div>
                        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.3rem', letterSpacing: '0.3em', color: `${accent}44`, marginBottom: 3 }}>MATERIAL</div>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.43rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}>{product.material}</div>
                      </div>
                    )}
                    {product.weight && (
                      <div>
                        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.3rem', letterSpacing: '0.3em', color: `${accent}44`, marginBottom: 3 }}>WEIGHT</div>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.43rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}>{product.weight}</div>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ flex: 1 }} />

                {/* CTAs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <motion.button
                    whileHover={{ scale: added ? 1 : 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || isCeremonyActive}
                    style={{
                      width: '100%', padding: '15px 0',
                      background: added
                        ? '#166534'
                        : product.stock === 0
                          ? 'rgba(60,60,60,0.25)'
                          : `linear-gradient(135deg, ${accent}bb, ${accent})`,
                      border: 'none',
                      color: added ? '#4ade80' : product.stock === 0 ? '#444' : '#000',
                      fontFamily: "'Cinzel', serif", fontSize: '0.58rem',
                      letterSpacing: '0.3em', cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 700, transition: 'all 0.3s',
                    }}
                  >
                    {added ? '𓂀 ARTIFACT CLAIMED' : product.stock === 0 ? 'DEPLETED' : 'CLAIM ARTIFACT'}
                  </motion.button>

                  <button onClick={handleReturn} style={{
                    width: '100%', padding: '10px 0',
                    background: 'transparent', border: `1px solid ${accent}22`,
                    color: `${accent}66`, fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '0.4rem', letterSpacing: '0.28em', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = accent; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = `${accent}66`; }}
                  >← RETURN TO TEMPLE</button>
                </div>
              </motion.div>
            </div>

            {/* Bottom accent line */}
            <div style={{
              height: 2, flexShrink: 0,
              background: `linear-gradient(90deg, transparent, ${accent}33, ${rarityColor}22, ${accent}33, transparent)`,
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
