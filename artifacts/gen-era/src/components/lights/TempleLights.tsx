export default function TempleLights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <pointLight position={[0, 3, 0]} intensity={1} color="#ff6b1a" />
      <pointLight position={[-5, 2, -5]} intensity={0.5} color="#d4a853" />
    </>
  );
}
