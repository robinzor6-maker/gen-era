import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TempleSearchState } from '@/hooks/useTempleSearch';
import { DISTRICT_COLORS } from '@/lib/lore/generateLore';
import type { District } from '@/lib/lore/generateLore';

interface Props {
  search: TempleSearchState;
  resultCount: number;
  totalCount: number;
}

const DISTRICTS: { id: District; label: string; glyph: string }[] = [
  { id: 'ankhron', label: 'ANKHRON', glyph: '𓂀' },
  { id: 'osyron',  label: 'OSYRON',  glyph: '𓃀' },
  { id: 'gencore', label: 'GEN CORE', glyph: '◈' },
];

export default function TempleSearchOverlay({ search, resultCount, totalCount }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, activeDistrict, setActiveDistrict, clearAll, isActive } = search;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        clearAll();
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clearAll]);

  const accent = activeDistrict ? DISTRICT_COLORS[activeDistrict].primary : '#d4a853';

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 200,
      padding: '14px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {/* Search row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        pointerEvents: 'auto',
      }}>
        {/* Search input */}
        <div style={{
          position: 'relative',
          flex: 1,
          maxWidth: 380,
        }}>
          <span style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.7rem',
            color: `${accent}66`,
            pointerEvents: 'none',
          }}>𓂀</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="SEARCH ARTIFACTS  [ / ]"
            style={{
              width: '100%',
              background: 'rgba(0,0,5,0.88)',
              border: `1px solid ${accent}${isActive ? '55' : '25'}`,
              color: '#fff',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.48rem',
              letterSpacing: '0.22em',
              padding: '9px 14px 9px 32px',
              outline: 'none',
              backdropFilter: 'blur(16px)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: isActive ? `0 0 16px ${accent}22` : 'none',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = `${accent}88`;
              e.currentTarget.style.boxShadow = `0 0 20px ${accent}22`;
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = `${accent}${isActive ? '55' : '25'}`;
              e.currentTarget.style.boxShadow = isActive ? `0 0 16px ${accent}22` : 'none';
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: `${accent}66`,
                cursor: 'pointer',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.55rem',
              }}
            >✕</button>
          )}
        </div>

        {/* District filter buttons */}
        {DISTRICTS.map(d => {
          const dc = DISTRICT_COLORS[d.id];
          const isActive = activeDistrict === d.id;
          return (
            <motion.button
              key={d.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveDistrict(isActive ? null : d.id)}
              style={{
                background: isActive ? `${dc.primary}22` : 'rgba(0,0,5,0.78)',
                border: `1px solid ${isActive ? dc.primary : dc.primary + '30'}`,
                color: isActive ? dc.primary : `${dc.primary}66`,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.38rem',
                letterSpacing: '0.22em',
                padding: '7px 12px',
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.2s',
                boxShadow: isActive ? `0 0 14px ${dc.primary}33` : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '0.6rem' }}>{d.glyph}</span>
              {d.label}
            </motion.button>
          );
        })}

        {/* Clear button */}
        <AnimatePresence>
          {(search.isActive) && (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={clearAll}
              style={{
                background: 'none',
                border: '1px solid rgba(212,168,83,0.2)',
                color: 'rgba(212,168,83,0.5)',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.38rem',
                letterSpacing: '0.2em',
                padding: '7px 12px',
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
              }}
            >
              CLEAR
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="count"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.38rem',
              letterSpacing: '0.3em',
              color: `${accent}77`,
              paddingLeft: 2,
              pointerEvents: 'none',
            }}
          >
            {resultCount === 0
              ? 'NO ARTIFACTS FOUND — REFINE YOUR SEARCH'
              : `${resultCount} / ${totalCount} ARTIFACTS ACTIVE`}
            {activeDistrict && (
              <span style={{ marginLeft: 16, color: DISTRICT_COLORS[activeDistrict].primary }}>
                ◈ {DISTRICT_COLORS[activeDistrict].label}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
