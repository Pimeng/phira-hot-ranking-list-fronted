import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import * as THREE from "three";
import type { Chart } from "@/types";

const glowVertexShader = `
  varying vec2 vUv;
  varying float vGlow;
  uniform float uTime;
  uniform float uIndex;

  void main() {
    vUv = uv;
    float pulse = sin(uTime * 2.0 + uIndex * 0.5) * 0.2 + 0.8;
    vGlow = pulse;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glowFragmentShader = `
  varying vec2 vUv;
  varying float vGlow;

  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    vec3 color1 = vec3(0.0, 0.941, 1.0);
    vec3 color2 = vec3(0.439, 0.0, 1.0);
    vec3 color3 = vec3(1.0, 0.0, 0.333);
    float angle = atan(vUv.y - 0.5, vUv.x - 0.5) / 6.28318 + 0.5;
    vec3 color = angle < 0.5 ? mix(color1, color2, angle * 2.0) : mix(color2, color3, (angle - 0.5) * 2.0);
    gl_FragColor = vec4(color * vGlow, alpha * 0.7);
  }
`;

const CYLINDER_SEGMENTS = 32;
const DISC_COUNT = 12;
const RADIUS = 3.2;

// Shared geometry instances for performance
const discGeometry = new THREE.CylinderGeometry(0.68, 0.68, 0.04, CYLINDER_SEGMENTS);
const coverGeometry = new THREE.BoxGeometry(0.55, 0.06, 0.55);
const holeGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16);
const blackMaterial = new THREE.MeshStandardMaterial({ color: "#0a0a0a", roughness: 0.3, metalness: 0.5 });
const holeMaterial = new THREE.MeshStandardMaterial({ color: "#050507", roughness: 0.8 });

interface DiscItemProps {
  chart: Chart;
  index: number;
  onSelect?: (chart: Chart) => void;
}

function DiscItem({ chart, index, onSelect }: DiscItemProps) {
  const glowMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const isGlow = index % 4 === 0;

  const angle = (index / DISC_COUNT) * Math.PI * 2;
  const position = useMemo(
    () => new THREE.Vector3(Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS, 0),
    [angle]
  );

  const texture = useMemo(() => {
    if (isGlow || !chart.illustration) return null;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    const tex = loader.load(chart.illustration);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [chart.illustration, isGlow]);

  const coverMaterial = useMemo(() => {
    if (!texture) return null;
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
    });
  }, [texture]);

  useFrame((state) => {
    if (glowMaterialRef.current) {
      glowMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const handleClick = () => {
    if (onSelect && !isGlow) onSelect(chart);
  };

  return (
    <group
      position={position}
      rotation={[0, 0, angle - Math.PI / 2]}
      onClick={handleClick}
    >
      {isGlow ? (
        <mesh geometry={discGeometry}>
          <shaderMaterial
            ref={glowMaterialRef}
            vertexShader={glowVertexShader}
            fragmentShader={glowFragmentShader}
            uniforms={{
              uTime: { value: 0 },
              uIndex: { value: index },
            }}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : (
        <group>
          <mesh geometry={discGeometry} material={blackMaterial} />
          {coverMaterial && (
            <mesh position={[0, 0.025, 0]} geometry={coverGeometry} material={coverMaterial} />
          )}
          <mesh position={[0, 0.03, 0]} geometry={holeGeometry} material={holeMaterial} />
        </group>
      )}
    </group>
  );
}

interface RingGroupProps {
  charts: Chart[];
  scrollSpeed: React.MutableRefObject<number>;
  onSelect?: (chart: Chart) => void;
}

function RingGroup({ charts, scrollSpeed, onSelect }: RingGroupProps) {
  const ringRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (ringRef.current) {
      scrollSpeed.current *= 0.95;
      ringRef.current.rotation.z -= delta * (0.15 + scrollSpeed.current);
      ringRef.current.position.y = Math.sin(_state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const items = useMemo(() => {
    const result: { chart: Chart; index: number }[] = [];
    for (let i = 0; i < DISC_COUNT; i++) {
      result.push({ chart: charts[i % charts.length], index: i });
    }
    return result;
  }, [charts]);

  return (
    <group rotation={[Math.PI / 6, 0, 0]}>
      <group ref={ringRef}>
        {items.map((item, i) => (
          <DiscItem
            key={`${item.chart.id}-${i}`}
            chart={item.chart}
            index={i}
            onSelect={onSelect}
          />
        ))}
      </group>
    </group>
  );
}

interface PhiraDiscRingProps {
  charts: Chart[];
  onSelectChart?: (chart: Chart) => void;
}

export default function PhiraDiscRing({ charts, onSelectChart }: PhiraDiscRingProps) {
  const scrollSpeed = useRef(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      scrollSpeed.current += e.deltaY * 0.0001;
      scrollSpeed.current = Math.max(-0.5, Math.min(0.5, scrollSpeed.current));
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  // Detect touch device for performance
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;
  const dpr = isTouchDevice ? [1, 1] as [number, number] : [1, 1.5] as [number, number];

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={dpr}
        gl={{ antialias: !isTouchDevice, alpha: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
        frameloop="always"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.6} />
        {charts.length > 0 && (
          <RingGroup
            charts={charts.slice(0, 12)}
            scrollSpeed={scrollSpeed}
            onSelect={onSelectChart}
          />
        )}
        <Preload all />
      </Canvas>
    </div>
  );
}
