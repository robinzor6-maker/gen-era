'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress, Html } from '@react-three/drei';
import Image from 'next/image';
import * as THREE from 'three';

// ─── Model Loader ──────────────────────────────────────────────────────────
function Model({
  modelPath,
  onInteract,
}: {
  modelPath: string;
  onInteract: () => void;
}) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [registered, setRegistered] = useState(false);

  // Auto-rotate until user grabs the model
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  // When OrbitControls fires pointer down, stop auto-rotate
  useEffect(() => {
    if (registered) return;
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const stop = () => {
      setAutoRotate(false);
      onInteract();
    };
    canvas.addEventListener('pointerdown', stop, { once: true });
    setRegistered(true);
    return () => canvas.removeEventListener('pointerdown', stop);
  }, [onInteract, registered]);

  // Center and scale the model to fit the viewport
  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale);
      const center = new THREE.Vector3();
      box.getCenter(center);
      groupRef.current.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale
      );
    }
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// ─── Loading Progress ──────────────────────────────────────────────────────
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="viewer-loader">
        <div className="loader-ring">
          <svg viewBox="0 0 50 50" className="loader-svg">
            <circle
              cx="25" cy="25" r="20"
              fill="none"
              stroke="var(--sand)"
              strokeWidth="2"
              strokeDasharray={`${progress * 1.257} 125.7`}
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="loader-pct font-mono">{Math.round(progress)}%</span>
      </div>
    </Html>
  );
}

// ─── Fallback Image ────────────────────────────────────────────────────────
function ModelFallback({ image, name }: { image: string; name: string }) {
  return (
    <div className="viewer-fallback">
      {image ? (
        <Image src={image} alt={name} fill className="fallback-img" sizes="50vw" />
      ) : (
        <div className="fallback-glyph">𓂀</div>
      )}
      <div className="fallback-badge">
        <span className="font-mono">3D UNAVAILABLE</span>
      </div>
    </div>
  );
}

// ─── Main Viewer ──────────────────────────────────────────────────────────
interface ProductViewerProps {
  modelPath: string;
  image: string;
  name: string;
}

export default function ProductViewer({ modelPath, image, name }: ProductViewerProps) {
  const [hasModel] = useState(() => Boolean(modelPath && modelPath.trim()));
  const [modelError, setModelError] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  if (!hasModel || modelError) {
    return <ModelFallback image={image} name={name} />;
  }

  return (
    <div className="product-viewer">
      {!userInteracted && (
        <div className="viewer-hint font-mono" aria-hidden="true">
          DRAG TO ROTATE
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true }}
        className="viewer-canvas"
      >
        {/* Lighting — ambient + two directionals for depth */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={1.5} />
        <directionalLight position={[-3, 1, -2]} intensity={0.4} color="#d4a853" />
        <pointLight position={[0, -2, 3]} intensity={0.3} color="#ff6b1a" />

        <Suspense fallback={<Loader />}>
          <Model
            modelPath={modelPath}
            onInteract={() => setUserInteracted(true)}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI * 0.8}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
