import { Component, ReactNode } from "react";
import { Link } from "wouter";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: "100vw", height: "100vh",
          background: "#000005",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 24,
          fontFamily: "'Cinzel', serif",
        }}>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
          <span style={{ fontSize: "3rem", filter: "drop-shadow(0 0 18px rgba(212,168,83,0.6))" }}>𓂀</span>
          <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.8rem", letterSpacing: "0.3em", color: "#d4a853", textShadow: "0 0 20px rgba(212,168,83,0.5)" }}>
            GEN <span style={{ color: "#ff6b1a" }}>ERA</span>
          </div>
          <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.3em", color: "rgba(212,168,83,0.45)", textAlign: "center", maxWidth: 340 }}>
            3D TEMPLE REQUIRES WEBGL — YOUR BROWSER OR DEVICE MAY NOT SUPPORT IT
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Link href="/classic" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "10px 28px", background: "linear-gradient(135deg, #c84800, #ff6b1a)",
                border: "none", color: "#fff", fontFamily: "'Cinzel', serif",
                fontSize: "0.5rem", letterSpacing: "0.25em", cursor: "pointer",
              }}>
                CLASSIC VIEW
              </button>
            </Link>
            <Link href="/store" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "10px 28px", background: "none",
                border: "1px solid rgba(212,168,83,0.3)", color: "#d4a853",
                fontFamily: "'Cinzel', serif", fontSize: "0.5rem",
                letterSpacing: "0.25em", cursor: "pointer",
              }}>
                ENTER STORE
              </button>
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
