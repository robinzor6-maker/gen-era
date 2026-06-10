"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

type ViewerProps = {
  model: string;
  accentColor?: string;
};

function ModelViewer({ model }: { model: string }) {
  const gltf = useGLTF(model);
  return <primitive object={gltf.scene} />;
}

export default function Viewer({ model, accentColor }: ViewerProps) {
  return (
    <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      {accentColor && <directionalLight position={[-3, 1, -2]} intensity={0.4} color={accentColor} />}
      <Suspense fallback={null}>
        <ModelViewer model={model} />
      </Suspense>
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}