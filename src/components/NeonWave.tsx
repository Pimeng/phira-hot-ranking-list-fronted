import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const waveVertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vZ;

  void main() {
    vUv = uv;
    float wave1 = sin(position.x * 1.5 + uTime * 0.5) * cos(position.y * 1.5 + uTime * 0.5) * 0.3;
    float wave2 = sin(position.x * 6.0 + uTime * 2.0) * 0.1;
    float z = wave1 + wave2;
    vZ = z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
  }
`;

const waveFragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vZ;

  void main() {
    vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 1.0, vUv.x));
    float glow = pow(abs(vZ) * 2.0, 0.5) * 0.3;
    color += vec3(glow);
    gl_FragColor = vec4(color, uOpacity);
  }
`;

interface WavePlaneProps {
  opacity: number;
  speed: number;
  zOffset: number;
}

function WavePlane({ opacity, speed, zOffset }: WavePlaneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#00F0FF") },
      uColor2: { value: new THREE.Color("#FF0055") },
      uOpacity: { value: opacity },
    }),
    [opacity]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value =
        state.clock.elapsedTime * speed;
    }
  });

  return (
    <mesh position={[0, 0, zOffset]}>
      <planeGeometry args={[8, 4, 64, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={waveVertexShader}
        fragmentShader={waveFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        wireframe
      />
    </mesh>
  );
}

function WaveScene() {
  return (
    <>
      <WavePlane opacity={0.15} speed={0.5} zOffset={-0.2} />
      <WavePlane opacity={0.4} speed={1.2} zOffset={0.1} />
    </>
  );
}

interface NeonWaveProps {
  className?: string;
  height?: string;
}

export default function NeonWave({ className = "", height = "300px" }: NeonWaveProps) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Canvas
        camera={{ position: [0, -2, 3], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <WaveScene />
      </Canvas>
    </div>
  );
}
