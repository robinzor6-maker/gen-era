import { Suspense, useRef, useMemo, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import TempleEnvironment from "./TempleEnvironment";
import VoidCore from "./VoidCore";
import TempleParticles from "./TempleParticles";
import TempleHotspot, { HotspotData } from "./TempleHotspot";
import HotspotPanel from "./HotspotPanel";
import ProductPedestal from "./products/ProductPedestal";
import EmptyPedestal from "./products/EmptyPedestal";
import CameraController from "./products/CameraController";
import TempleDistrictManager from "./TempleDistrictManager";
import TempleSearchOverlay from "./TempleSearchOverlay";
import { useTempleProducts } from "@/hooks/useTempleProducts";
import { useTempleSearch } from "@/hooks/useTempleSearch";
import { useTempleFilters } from "@/hooks/useTempleFilters";

const HOTSPOTS: HotspotData[] = [
  {
    id: "north",
    position: [0, 3.5, -10],
    label: "COLLECTIONS",
    wing: "NORTH WING",
    description:
      "The great archive of GEN ERA artefacts. Each collection holds curated objects forged across eras — from the Pharaoh Cyber line to the Obsidian series. Every piece carries lore, power, and meaning.",
    future: "COMING SOON — BROWSE COLLECTIONS",
    color: "#d4a853",
  },
  {
    id: "east",
    position: [10, 3.5, 0],
    label: "CHARACTERS",
    wing: "EAST WING",
    description:
      "ANKHRON — keeper of the past, wielder of cosmic wisdom. OSYRON — fire of revolution, energy unbound. Meet the entities that shape the GEN ERA universe and the lore behind each artefact.",
    future: "COMING SOON — ENTER CHARACTER UNIVERSE",
    color: "#ff6b1a",
  },
  {
    id: "west",
    position: [-10, 3.5, 0],
    label: "LORE",
    wing: "WEST WING",
    description:
      "The sacred texts. Every artefact has an origin. Every collection has a chapter. The Lore Wing houses the living mythology of GEN ERA — stories that expand with each new drop.",
    future: "COMING SOON — READ THE LORE",
    color: "#00d4ff",
  },
  {
    id: "south",
    position: [0, 3.5, 10],
    label: "STORE ACCESS",
    wing: "SOUTH WING",
    description:
      "The commerce gateway. All physical artefacts, limited drops, and digital collectibles pass through the South Wing. Enter to browse the current inventory and secure your claim.",
    future: "ENTER STORE →",
    color: "#c084fc",
  },
  {
    id: "center",
    position: [0, 7.5, 0],
    label: "VOID CORE",
    wing: "CENTER — VOID CORE",
    description:
      "The heart of the temple. The Void Core is a portal between what was and what will be. It pulses with the energy of every artefact ever created under the GEN ERA sigil.",
    future: "ACTIVATE PORTAL — PHASE 3 UNLOCK",
    color: "#d4a853",
  },
];

// Pedestal positions — 9 slots around the temple floor
const PEDESTAL_POSITIONS: [number, number, number][] = [
  [-4, 0, 7],
  [0, 0, 8],
  [4, 0, 7],
  [-7.5, 0, 2.5],
  [7.5, 0, 2.5],
  [-7.5, 0, -2.5],
  [7.5, 0, -2.5],
  [-3.5, 0, -7],
  [3.5, 0, -7],
];

function SceneLights() {
  return (
    <>
      <ambientLight color="#0d0520" intensity={0.9} />
      <directionalLight
        color="#d4a853" intensity={0.65}
        position={[10, 18, 8]} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
      />
      <pointLight color="#ff6b1a" intensity={1.3} position={[0, 8, 0]}    distance={25} decay={2} />
      <pointLight color="#1a0050" intensity={2.2} position={[0, 0.5, 0]}  distance={20} decay={2} />
      <pointLight color="#d4a853" intensity={0.45} position={[-15, 5, -15]} distance={18} decay={2} />
      <pointLight color="#ff6b1a" intensity={0.45} position={[15, 5, 15]}  distance={18} decay={2} />
      <pointLight color="#00d4ff" intensity={0.25} position={[15, 5, -15]} distance={14} decay={2} />
    </>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.1, 4, 4]} />
      <meshBasicMaterial color="#d4a853" />
    </mesh>
  );
}

function TempleProducts({
  controlsRef,
  products,
  allProducts,
}: {
  controlsRef: RefObject<any>;
  products: ReturnType<typeof useTempleFilters>;
  allProducts: ReturnType<typeof useTempleFilters>;
}) {
  return (
    <>
      <CameraController controlsRef={controlsRef} />
      <TempleDistrictManager products={allProducts} />
      {PEDESTAL_POSITIONS.map((pos, i) => {
        const product = products[i];
        return product ? (
          <ProductPedestal key={product._id} product={product} position={pos} index={i} />
        ) : (
          <EmptyPedestal key={`empty-${i}`} position={pos} index={i} />
        );
      })}
    </>
  );
}

interface TempleSceneProps {
  openHotspotId: string | null;
  onHotspotOpen: (id: string) => void;
}

export default function TempleScene({ openHotspotId, onHotspotOpen }: TempleSceneProps) {
  const controlsRef = useRef<any>(null);
  const { products } = useTempleProducts();
  const search       = useTempleSearch();
  const filtered     = useTempleFilters(products, search);

  const openHotspot = useMemo(
    () => HOTSPOTS.find(h => h.id === openHotspotId) ?? null,
    [openHotspotId]
  );

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 5, 16], fov: 65, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ background: "#000005" }}
      >
        <fog attach="fog" args={["#000005", 22, 55]} />

        <SceneLights />

        <Suspense fallback={<LoadingFallback />}>
          <TempleEnvironment />
          <VoidCore />
          <TempleParticles count={300} />

          {HOTSPOTS.map(h => (
            <TempleHotspot
              key={h.id}
              data={h}
              onOpen={onHotspotOpen}
              isOpen={openHotspotId === h.id}
            />
          ))}

          <TempleProducts
            controlsRef={controlsRef}
            products={filtered}
            allProducts={products}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableDamping
          dampingFactor={0.055}
          minDistance={5}
          maxDistance={22}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.1}
          rotateSpeed={0.55}
          zoomSpeed={0.7}
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
          target={[0, 3, 0]}
        />
      </Canvas>

      {/* HTML overlays */}
      <TempleSearchOverlay
        search={search}
        resultCount={filtered.length}
        totalCount={products.length}
      />

      <HotspotPanel data={openHotspot} onClose={() => onHotspotOpen("")} />
    </>
  );
}
