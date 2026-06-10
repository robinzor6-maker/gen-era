import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';

interface LoreChapter {
  id: string;
  glyph: string;
  year: string;
  title: string;
  subtitle: string;
  body: string[];
}

const chapters: LoreChapter[] = [
  {
    id: 'genesis',
    glyph: '𓂀',
    year: 'YEAR ZERO · THE ORIGIN',
    title: 'BEFORE THE FIRST LIGHT',
    subtitle: 'The Void Remembers',
    body: [
      'Before the silicon, before the circuits, before the code — there was the Void. A darkness so complete it could see itself thinking.',
      'The ancient ones knew this darkness. They called it Nun: the primordial waters from which all creation emerged. They built their temples at the edge of this void, so the gods could reach through.',
      'GEN ERA began the same way. Not in a studio. Not in a boardroom. In the space between sleep and waking, where the old symbols speak in frequencies we have forgotten how to hear.',
      'This is not fashion. This is archaeology of the future.',
    ],
  },
  {
    id: 'pharaohs',
    glyph: '𓋹',
    year: 'THE FIRST DYNASTY · ANCIENT FREQUENCY',
    title: 'THE PHARAOHS WERE CYBORGS',
    subtitle: 'Technology as Divinity',
    body: [
      'The double crown of Egypt was not merely ceremonial. It was an antenna. The crook and flail were instruments of calibration. The ceremonial beard — a power conduit connecting the ruler to the Duat.',
      'They understood what we are only now rediscovering: that consciousness can be amplified through material. That certain metals, certain geometries, certain symbols carry frequencies that interact with the bioelectric field of the human body.',
      'The Eye of Horus is not mythology. It is a schematic. A blueprint for perception beyond the visible spectrum — infrared, ultraviolet, radiowaves. The pineal gland as receiver. The Ka as software.',
      'GEN ERA garments are built on this understanding. Every embroidery placement, every metal choice, every geometric cut has been designed to resonate.',
    ],
  },
  {
    id: 'temples',
    glyph: '𓇯',
    year: 'THE TEMPLE PROTOCOL · ARCHITECTURE',
    title: 'THE TEMPLE IS A SERVER',
    subtitle: 'Sacred Architecture as Neural Network',
    body: [
      'Karnak was not built to glorify kings. Karnak was built to process information at civilizational scale.',
      'The alignment of temples across 600 kilometers of the Nile valley forms a geometric lattice — a distributed processing network that used human consciousness as the processing unit. Pilgrims were the packets. Priests were the routers.',
      'The Temple of Commerce is GEN ERA\'s contribution to this network. It operates in the digital spectrum, but its architecture mirrors the original. Entrance requires intention. Navigation requires focus. Acquisition requires exchange.',
      'When you wear GEN ERA, you become a node in this network. The symbols on your back carry meaning that moves through space, activating responses in those who can read them.',
    ],
  },
  {
    id: 'void-season',
    glyph: '𓆑',
    year: 'VOID SEASON I · THE FIRST COLLECTION',
    title: 'DRESSING FOR THE DARKNESS',
    subtitle: 'Wardobe of the Initiated',
    body: [
      'Void Season I was designed for transition. For the space between what was and what will be. For the 3am hours when the old world has ended and the new world has not yet loaded.',
      'The palette is darkness because darkness is not absence — it is potential. The Void is not empty. It is pregnant with every frequency that has ever existed and every frequency that has not yet been imagined.',
      'The gold embroideries mark you as one who has come through the darkness and returned with knowledge. They are not decoration. They are certification.',
      'Wear black. Wear gold. Move through the city like a transmission no one has the decoder for yet.',
    ],
  },
  {
    id: 'ankh-protocol',
    glyph: '𓆓',
    year: 'ANKH PROTOCOL · THE ACCESSORIES SYSTEM',
    title: 'JEWELRY AS TECHNOLOGY',
    subtitle: 'Wearable Frequencies',
    body: [
      'The Ankh is the oldest symbol of sustained life in recorded human history. It predates writing. It predates agriculture. Someone — or something — left it as a message.',
      'The loop at the top represents the eternal: the soul\'s circuit that cannot be broken by death. The cross below represents the material: the body navigating time and space. Together they say: you are both, simultaneously.',
      'The Ankh Protocol collection takes this geometry and renders it in modern materials — titanium, sterling silver, 18k gold plate — because the message does not change. Only the substrate.',
      'Every piece in the Ankh Protocol carries a unique serial number stamped on its reverse face. This is your registration. Your membership in a lineage that has been running for 5,000 years and counting.',
    ],
  },
  {
    id: 'future',
    glyph: '𓅓',
    year: 'THE NEXT ITERATION · WHAT COMES AFTER',
    title: 'THE ARCHIVE EXPANDS',
    subtitle: 'Fragments from the Coming Seasons',
    body: [
      'Nile Fire: For those who have passed through the Void and come out burning. Outerwear in the colors of the scorched horizon.',
      'AR Protocol: Your garment as portal. Point your camera at the symbols. Watch what comes through.',
      'The Living Collection: Garments grown from mycelium and printed on biosynthetic substrate. Fashion that breathes. Fashion that decomposes into soil that grows new material.',
      'The Temple Community: A private network for those who have acquired three or more artifacts. Encrypted channels. Early access. Coordinates for physical gatherings in cities around the world.',
      'The archive is never complete. The pharaohs built for eternity. GEN ERA builds for what comes after eternity.',
    ],
  },
];

export default function LorePage() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
      setScrollProgress(scrollTop / (scrollHeight - clientHeight));

      chapterRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= clientHeight * 0.4 && rect.bottom > 0) {
          setActiveChapter(i);
        }
      });
    };

    const el = mainRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000005', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56, flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(0,0,5,0.98), rgba(0,0,5,0.6))',
        borderBottom: '1px solid rgba(212,168,83,0.09)',
        position: 'relative', zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.15em', color: 'rgba(212,168,83,0.5)' }}>
          ← TEMPLE
        </Link>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.3em', color: '#d4a853', textShadow: 'var(--glow-gold)' }}>
          GEN ERA
        </div>
        <Link href="/store" style={{ textDecoration: 'none' }}>
          <button className="btn-gold font-mono" style={{ fontSize: '0.72rem', padding: '6px 16px' }}>
            ENTER ARCHIVE →
          </button>
        </Link>
      </header>

      {/* ── Progress Bar ─────────────────────────────────────────────────── */}
      <div style={{ height: 2, background: 'rgba(212,168,83,0.08)', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          width: `${scrollProgress * 100}%`,
          background: 'linear-gradient(90deg, var(--ember), var(--fire), var(--sand))',
          transition: 'width 0.1s linear',
        }} />
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Chapter Navigation (desktop sidebar) ─────────────────────── */}
        <nav style={{
          width: 200, flexShrink: 0,
          padding: '32px 16px',
          borderRight: '1px solid rgba(212,168,83,0.08)',
          display: 'flex', flexDirection: 'column', gap: 4,
          overflowY: 'auto',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.3em', color: 'rgba(212,168,83,0.3)', marginBottom: 16 }}>
            LORE ARCHIVE
          </p>
          {chapters.map((ch, i) => (
            <button
              key={ch.id}
              onClick={() => {
                chapterRefs.current[i]?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: activeChapter === i ? 'rgba(212,168,83,0.06)' : 'none',
                border: 'none',
                borderLeft: `2px solid ${activeChapter === i ? 'var(--fire)' : 'rgba(212,168,83,0.1)'}`,
                color: activeChapter === i ? '#f0c875' : 'rgba(212,168,83,0.35)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                padding: '8px 12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                lineHeight: 1.4,
              }}
            >
              <span style={{ display: 'block', fontSize: '1rem', marginBottom: 4 }}>{ch.glyph}</span>
              {ch.title.split(' ').slice(0, 3).join(' ')}...
            </button>
          ))}
        </nav>

        {/* ── Main Scroll Content ──────────────────────────────────────── */}
        <main
          ref={mainRef}
          style={{ flex: 1, overflowY: 'auto', padding: '0 48px' }}
        >
          {/* Hero */}
          <section style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 0 60px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.4em', color: 'rgba(212,168,83,0.35)', marginBottom: 20 }}>
              𓂀 &nbsp; CLASSIFIED ARCHIVE &nbsp; 𓂀
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.15em', color: '#fff', lineHeight: 1.1, marginBottom: 24 }}>
              THE LORE<br />
              <em style={{ color: 'var(--fire)', fontStyle: 'normal' }}>ARCHIVE</em>
            </h1>
            <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '520px', lineHeight: 1.7 }}>
              Every artifact carries a story older than the brand. These are the transmissions we've intercepted from across five millennia.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
              {['𓂀', '𓋹', '𓇯', '𓆑', '𓆓', '𓅓', '𓆼', '𓂋'].map((g, i) => (
                <span key={i} style={{
                  fontFamily: 'serif', fontSize: '1.6rem',
                  color: `rgba(212,168,83,${0.06 + i * 0.04})`,
                  animation: `eyeGlow ${3 + i * 0.4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}>{g}</span>
              ))}
            </div>
          </section>

          {/* Chapters */}
          {chapters.map((chapter, i) => (
            <section
              key={chapter.id}
              ref={(el) => { chapterRefs.current[i] = el; }}
              style={{
                minHeight: '80vh', padding: '80px 0',
                borderTop: '1px solid rgba(212,168,83,0.06)',
                position: 'relative',
              }}
            >
              {/* Glyph watermark */}
              <div style={{
                position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
                fontSize: '20rem', color: 'rgba(212,168,83,0.02)',
                fontFamily: 'serif', pointerEvents: 'none', lineHeight: 1,
                userSelect: 'none',
              }}>
                {chapter.glyph}
              </div>

              <div style={{ maxWidth: '640px', position: 'relative' }}>
                {/* Chapter number */}
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.4em', color: 'rgba(212,168,83,0.3)', marginBottom: 16 }}>
                  {String(i + 1).padStart(2, '0')} &nbsp;/&nbsp; {chapter.year}
                </p>

                {/* Glyph */}
                <div style={{
                  fontSize: '3rem', marginBottom: 20,
                  filter: activeChapter === i ? 'drop-shadow(0 0 20px rgba(212,168,83,0.6))' : 'none',
                  transition: 'filter 0.6s ease',
                }}>
                  {chapter.glyph}
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.6rem)',
                  letterSpacing: '0.1em', color: '#fff', lineHeight: 1.1, marginBottom: 8,
                }}>
                  {chapter.title}
                </h2>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.2em', color: 'var(--fire)', marginBottom: 32 }}>
                  {chapter.subtitle}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {chapter.body.map((paragraph, pi) => (
                    <p key={pi} style={{
                      fontFamily: pi === 0 ? 'var(--font-cinzel)' : 'var(--font-trirong)',
                      fontSize: pi === 0 ? '1rem' : '0.92rem',
                      color: pi === 0 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)',
                      lineHeight: 1.85,
                      fontWeight: pi === 0 ? 600 : 400,
                    }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          ))}

          {/* Footer CTA */}
          <section style={{ padding: '80px 0 120px', borderTop: '1px solid rgba(212,168,83,0.06)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.4em', color: 'rgba(212,168,83,0.3)', marginBottom: 24 }}>
              𓂀 &nbsp; END OF TRANSMISSION &nbsp; 𓂀
            </p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginBottom: 16 }}>
              THE ARCHIVE <em style={{ color: 'var(--fire)', fontStyle: 'normal' }}>AWAITS</em>
            </h3>
            <p style={{ fontFamily: 'var(--font-cinzel)', color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>
              Carry the signal. Acquire the artifacts.
            </p>
            <Link href="/store">
              <button className="btn-fire" style={{ padding: '16px 40px', fontSize: '0.85rem', letterSpacing: '0.2em' }}>
                ENTER THE ARCHIVE ⚡
              </button>
            </Link>
          </section>
        </main>
      </div>

      <style>{`
        @keyframes eyeGlow {
          0%,100% { filter: drop-shadow(0 0 6px rgba(212,168,83,0.3)); }
          50% { filter: drop-shadow(0 0 18px rgba(212,168,83,0.7)); }
        }
      `}</style>
    </div>
  );
}
