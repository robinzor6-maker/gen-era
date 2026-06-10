export default function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#050508" roughness={1} metalness={0.1} />
    </mesh>
  );
}
