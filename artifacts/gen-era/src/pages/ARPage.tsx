import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';

type ARStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unsupported';
type ARMode = 'tryon' | 'scan' | 'portal';

export default function ARPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<ARStatus>('idle');
  const [mode, setMode] = useState<ARMode>('tryon');
  const [deviceInfo, setDeviceInfo] = useState({ mobile: false, webxr: false, camera: false });

  useEffect(() => {
    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|Android/i.test(ua);
    const hasWebXR = 'xr' in navigator;
    const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    setDeviceInfo({ mobile: isMobile, webxr: hasWebXR, camera: hasCamera });
  }, []);

  async function startCamera() {
    if (!deviceInfo.camera) {
      setStatus('unsupported');
      return;
    }

    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('active');
    } catch (err) {
      console.warn('Camera error:', err);
      setStatus('denied');
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const modes: { id: ARMode; glyph: string; name: string; desc: string; status: 'live' | 'soon' }[] = [
    { id: 'tryon', glyph: '𓋹', name: 'TRY-ON', desc: 'Overlay GEN ERA garments on your body in real-time using the rear camera.', status: 'live' },
    { id: 'scan', glyph: '𓂀', name: 'GLYPH SCAN', desc: 'Point at any GEN ERA glyph to unlock hidden content and animated sequences.', status: 'soon' },
    { id: 'portal', glyph: '𓇯', name: 'VOID PORTAL', desc: 'Open a portal to the Temple of Commerce through your environment.', status: 'soon' },
  ];

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000005', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
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
          AR PORTAL
        </div>
        <Link href="/store" style={{ textDecoration: 'none' }}>
          <button className="btn-gold font-mono" style={{ fontSize: '0.72rem', padding: '6px 16px' }}>
            ARCHIVE →
          </button>
        </Link>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ── Camera / Preview Area ─────────────────────────────────────── */}
        <div style={{ flex: 1, position: 'relative', background: '#000005' }}>
          {status === 'active' ? (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />

              {/* AR Overlay — HUD elements */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {/* Corner brackets */}
                {['tl', 'tr', 'bl', 'br'].map((pos) => (
                  <div key={pos} style={{
                    position: 'absolute',
                    ...(pos.includes('t') ? { top: 24 } : { bottom: 24 }),
                    ...(pos.includes('l') ? { left: 24 } : { right: 24 }),
                    width: 40, height: 40,
                    borderTop: pos.includes('t') ? '2px solid rgba(0,212,255,0.7)' : 'none',
                    borderBottom: pos.includes('b') ? '2px solid rgba(0,212,255,0.7)' : 'none',
                    borderLeft: pos.includes('l') ? '2px solid rgba(0,212,255,0.7)' : 'none',
                    borderRight: pos.includes('r') ? '2px solid rgba(0,212,255,0.7)' : 'none',
                  }} />
                ))}

                {/* Center reticle */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80, height: 80,
                }}>
                  <div style={{
                    width: '100%', height: '100%',
                    border: '1px solid rgba(0,212,255,0.4)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'arPulse 2s ease-in-out infinite',
                  }}>
                    <span style={{ fontFamily: 'serif', fontSize: '1.8rem', color: 'rgba(0,212,255,0.6)' }}>𓂀</span>
                  </div>
                </div>

                {/* Status */}
                <div style={{
                  position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(0,0,5,0.7)', border: '1px solid rgba(0,212,255,0.3)',
                  padding: '4px 16px', backdropFilter: 'blur(8px)',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.2em', color: '#00d4ff' }}>
                    ● CAMERA ACTIVE — {mode.toUpperCase()} MODE
                  </span>
                </div>

                {/* Mode indicator — bottom left */}
                <div style={{
                  position: 'absolute', bottom: 80, left: 24,
                  background: 'rgba(0,0,5,0.8)', border: '1px solid rgba(212,168,83,0.2)',
                  padding: '12px 16px', backdropFilter: 'blur(12px)',
                }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(212,168,83,0.4)', marginBottom: 4 }}>ACTIVE MODE</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#f0c875', letterSpacing: '0.1em' }}>
                    {modes.find((m) => m.id === mode)?.glyph} {mode.toUpperCase()}
                  </p>
                  {mode === 'tryon' && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(0,212,255,0.6)', marginTop: 6, maxWidth: 180 }}>
                      Stand 1.5–2m from camera. Full body in frame.
                    </p>
                  )}
                </div>
              </div>

              {/* Stop button */}
              <button
                onClick={stopCamera}
                style={{
                  position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(0,0,5,0.8)', border: '1px solid rgba(212,168,83,0.3)',
                  color: '#d4a853', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                  letterSpacing: '0.15em', padding: '10px 28px', cursor: 'pointer',
                  backdropFilter: 'blur(12px)', zIndex: 20,
                }}
              >
                ✕ CLOSE PORTAL
              </button>
            </>
          ) : (
            /* ── Idle/Error State ──────────────────────────────────────── */
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '40px',
            }}>
              {/* Background glyphs */}
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {['𓂀', '𓋹', '𓇯', '𓆑'].map((g, i) => (
                  <span key={i} style={{
                    position: 'absolute',
                    top: `${20 + i * 20}%`, left: `${10 + i * 20}%`,
                    fontSize: '8rem', color: 'rgba(212,168,83,0.02)',
                    fontFamily: 'serif',
                    animation: `eyeGlow ${4 + i}s ease-in-out infinite`,
                    animationDelay: `${i * 0.8}s`,
                  }}>{g}</span>
                ))}
              </div>

              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 480 }}>
                <div style={{ fontSize: '4rem', marginBottom: 24, animation: 'eyeGlow 3s ease-in-out infinite' }}>
                  𓇯
                </div>

                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: '0.15em', color: '#fff', marginBottom: 8 }}>
                  AR <em style={{ color: 'var(--fire)', fontStyle: 'normal' }}>PORTAL</em>
                </h2>

                {status === 'denied' && (
                  <div style={{ margin: '16px 0', padding: '12px 20px', border: '1px solid rgba(255,50,50,0.3)', background: 'rgba(255,50,50,0.05)' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,100,100,0.8)', letterSpacing: '0.1em' }}>
                      CAMERA ACCESS DENIED — Enable camera permissions in your browser settings to use the AR portal.
                    </p>
                  </div>
                )}

                {status === 'unsupported' && (
                  <div style={{ margin: '16px 0', padding: '12px 20px', border: '1px solid rgba(212,168,83,0.2)', background: 'rgba(212,168,83,0.05)' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(212,168,83,0.6)', letterSpacing: '0.1em' }}>
                      DEVICE NOT SUPPORTED — This AR experience requires a device with a camera. For best results, use Chrome or Safari on a modern smartphone.
                    </p>
                  </div>
                )}

                {status === 'idle' && (
                  <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', marginBottom: 32, lineHeight: 1.7 }}>
                    Experience GEN ERA artifacts in augmented reality. Select a mode and activate your camera to open the portal.
                  </p>
                )}

                {/* Device capability indicators */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
                  {[
                    { label: 'CAMERA', ok: deviceInfo.camera },
                    { label: 'MOBILE', ok: deviceInfo.mobile },
                    { label: 'WEBXR', ok: deviceInfo.webxr },
                  ].map((cap) => (
                    <div key={cap.label} style={{
                      padding: '4px 10px',
                      border: `1px solid ${cap.ok ? 'rgba(0,255,136,0.3)' : 'rgba(212,168,83,0.15)'}`,
                      fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                      letterSpacing: '0.12em',
                      color: cap.ok ? 'rgba(0,255,136,0.7)' : 'rgba(212,168,83,0.3)',
                    }}>
                      {cap.ok ? '● ' : '○ '}{cap.label}
                    </div>
                  ))}
                </div>

                <button
                  onClick={startCamera}
                  disabled={status === 'requesting'}
                  className="btn-fire"
                  style={{ padding: '14px 40px', fontSize: '0.85rem', letterSpacing: '0.2em', width: '100%', maxWidth: 320 }}
                >
                  {status === 'requesting' ? 'OPENING PORTAL...' : '⚡ OPEN AR PORTAL'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Panel ───────────────────────────────────────────────── */}
        <div style={{
          width: 280, flexShrink: 0,
          borderLeft: '1px solid rgba(212,168,83,0.08)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Mode selection */}
          <div style={{ padding: '24px 16px', borderBottom: '1px solid rgba(212,168,83,0.08)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.3em', color: 'rgba(212,168,83,0.35)', marginBottom: 12 }}>
              SELECT MODE
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  style={{
                    background: mode === m.id ? 'rgba(212,168,83,0.06)' : 'none',
                    border: `1px solid ${mode === m.id ? 'rgba(212,168,83,0.35)' : 'rgba(212,168,83,0.1)'}`,
                    borderLeft: `3px solid ${mode === m.id ? 'var(--fire)' : 'rgba(212,168,83,0.1)'}`,
                    padding: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.1rem' }}>{m.glyph}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', color: mode === m.id ? '#f0c875' : 'rgba(212,168,83,0.5)' }}>
                        {m.name}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.08em', padding: '2px 6px',
                      background: m.status === 'live' ? 'rgba(0,255,136,0.1)' : 'rgba(212,168,83,0.06)',
                      border: `1px solid ${m.status === 'live' ? 'rgba(0,255,136,0.3)' : 'rgba(212,168,83,0.1)'}`,
                      color: m.status === 'live' ? 'rgba(0,255,136,0.7)' : 'rgba(212,168,83,0.3)',
                    }}>
                      {m.status === 'live' ? '● LIVE' : 'SOON'}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(212,168,83,0.3)', lineHeight: 1.5, letterSpacing: '0.04em' }}>
                    {m.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(212,168,83,0.08)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.3em', color: 'rgba(212,168,83,0.35)', marginBottom: 12 }}>
              INSTRUCTIONS
            </p>
            {[
              { n: '01', text: 'Select an AR mode above' },
              { n: '02', text: 'Click OPEN AR PORTAL' },
              { n: '03', text: 'Allow camera access when prompted' },
              { n: '04', text: mode === 'tryon' ? 'Stand 1.5–2m from camera, full body visible' : 'Point camera at GEN ERA glyph' },
              { n: '05', text: 'The portal will activate automatically' },
            ].map((step) => (
              <div key={step.n} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--fire)', minWidth: 20 }}>{step.n}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(212,168,83,0.45)', letterSpacing: '0.06em', lineHeight: 1.5 }}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          {/* Coming soon */}
          <div style={{ padding: '20px 16px', flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.3em', color: 'rgba(212,168,83,0.35)', marginBottom: 12 }}>
              FUTURE PROTOCOLS
            </p>
            {[
              { icon: '𓋹', title: 'Snapchat Lens', desc: 'GEN ERA AR filter for Snapchat' },
              { icon: '𓂀', title: 'Instagram AR', desc: 'Story filter with Eye of Horus overlay' },
              { icon: '𓇯', title: 'Apple Vision Pro', desc: 'Full spatial shopping experience' },
              { icon: '𓆑', title: 'WebXR Rooms', desc: 'Browse the Temple in immersive 3D' },
            ].map((item) => (
              <div key={item.title} style={{ display: 'flex', gap: 10, marginBottom: 14, opacity: 0.5 }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(212,168,83,0.5)', letterSpacing: '0.08em' }}>{item.title}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'rgba(212,168,83,0.25)', marginTop: 2 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes eyeGlow {
          0%,100% { filter: drop-shadow(0 0 6px rgba(212,168,83,0.3)); opacity: 0.8; }
          50% { filter: drop-shadow(0 0 24px rgba(212,168,83,0.7)); opacity: 1; }
        }
        @keyframes arPulse {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
