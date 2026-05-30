import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import * as THREE from "three";
import type { Chart } from "@/types";

// Vertex shader for the glow disc
const glowVertexShader = `
  varying vec2 vUv;
  varying float vGlow;
  uniform float uTime;
  uniform int uIndex;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float pulse = sin(uTime * 2.0 + float(uIndex) * 0.5) * 0.2 + 0.8;
    vGlow = pulse;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader for the glow disc
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
    vec3 color;
    if (angle < 0.5) {
      color = mix(color1, color2, angle * 2.0);
    } else {
      color = mix(color2, color3, (angle - 0.5) * 2.0);
    }
    gl_FragColor = vec4(color * vGlow, alpha * 0.7);
  }
`;

interface DiscItemProps {
  chart: Chart;
  index: number;
  total: number;
  onSelect?: (chart: Chart) => void;
}

function DiscItem({ chart, index, total, onSelect }: DiscItemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const isGlow = index % 5 === 0; // Every 5th is a glow disc

  const angle = useMemo(() => (index / total) * Math.PI * 2, [index, total]);
  const radius = 3.2;

  const position = useMemo(
    () => new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0),
    [angle, radius]
  );

  // Load texture for non-glow discs
  const texture = useMemo(() => {
    if (isGlow || !chart.illustration) return null;
    try {
      const loader = new THREE.TextureLoader();
      loader.crossOrigin = "anonymous";
      const tex = loader.load(chart.illustration);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    } catch {
      return null;
    }
  }, [chart.illustration, isGlow]);

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
      ref={groupRef}
      position={position}
      rotation={[0, 0, angle - Math.PI / 2]}
      onClick={handleClick}
    >
      {isGlow ? (
        <mesh>
          <cylinderGeometry args={[0.72, 0.72, 0.06, 64]} />
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
          {/* Black disc base */}
          <mesh>
            <cylinderGeometry args={[0.68, 0.68, 0.04, 64]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Cover image on top */}
          {texture && (
            <mesh position={[0, 0.025, 0]} rotation={[0, 0, 0]}>
              <boxGeometry args={[0.55, 0.06, 0.55]} />
              <meshStandardMaterial
                map={texture}
                roughness={0.4}
                metalness={0.1}
                transparent
              />
            </mesh>
          )}
          {/* Center hole */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.08, 32]} />
            <meshStandardMaterial color="#050507" roughness={0.8} />
          </mesh>
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
  const floatRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (ringRef.current) {
      // Base rotation + scroll boost
      scrollSpeed.current *= 0.95; // Friction
      ringRef.current.rotation.z -=
        delta * (0.15 + scrollSpeed.current);
    }
    if (floatRef.current) {
      // Gentle floating
      floatRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const items = useMemo(() => {
    const total = 20;
    const result: { chart: Chart; isGlow: boolean }[] = [];
    for (let i = 0; i < total; i++) {
      const chart = charts[i % charts.length];
      result.push({ chart, isGlow: i % 5 === 0 });
    }
    return result;
  }, [charts]);

  return (
    <group ref={floatRef} rotation={[Math.PI / 6, 0, 0]}>
      <group ref={ringRef}>
        {items.map((item, i) => (
          <DiscItem
            key={`${item.chart.id}-${i}`}
            chart={item.chart}
            index={i}
            total={20}
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

export default function PhiraDiscRing({
  charts,
  onSelectChart,
}: PhiraDiscRingProps) {
  const scrollSpeed = useRef(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      scrollSpeed.current += e.deltaY * 0.0001;
      scrollSpeed.current = Math.max(
        -0.5,
        Math.min(0.5, scrollSpeed.current)
      );
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <pointLight
          position={[-5, -5, 3]}
          intensity={0.4}
          color="#00f0ff"
        />
        <pointLight
          position={[5, -5, 3]}
          intensity={0.3}
          color="#ff0055"
        />
        {charts.length > 0 && (
          <RingGroup
            charts={charts}
            scrollSpeed={scrollSpeed}
            onSelect={onSelectChart}
          />
        )}
        <Preload all />
      </Canvas>
    </div>
  );
}
