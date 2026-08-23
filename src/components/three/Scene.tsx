"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh } from "three";

const PALETTE = ["#FF6FA5", "#FFC93C", "#6FD8FF", "#7CE38B", "#B98BFF"];
const TEDDY_BROWN = ["#C68B59", "#A9744A"];

function HeadingBall({
  from,
  to,
  color,
  height = 0.3,
  duration = 5.5,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  height?: number;
  duration?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    const phase = state.clock.elapsedTime * ((Math.PI * 2) / duration) - Math.PI / 2;
    const t = (Math.sin(phase) + 1) / 2;
    ref.current.position.set(
      THREE.MathUtils.lerp(from[0], to[0], t),
      THREE.MathUtils.lerp(from[1], to[1], t) + Math.sin(t * Math.PI) * height,
      THREE.MathUtils.lerp(from[2], to[2], t)
    );
    ref.current.rotation.y += delta * 2;
    ref.current.rotation.x += delta * 1.1;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.9, 24, 24]} />
      <MeshDistortMaterial color={color} distort={0.28} speed={2} roughness={0.2} metalness={0.1} />
    </mesh>
  );
}

function Block({
  position,
  color,
  speed,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.6;
      ref.current.rotation.x += delta * 0.2;
    }
  });
  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.6}>
      <RoundedBox ref={ref} args={[0.9, 0.9, 0.9]} radius={0.15} position={position}>
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
      </RoundedBox>
    </Float>
  );
}

function Star({
  position,
  color,
  speed,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  scale?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.5;
  });
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const spikes = 5;
    const outer = 0.55;
    const inner = 0.24;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i / (spikes * 2)) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);

  return (
    <Float speed={speed} rotationIntensity={1.2} floatIntensity={2}>
      <mesh ref={ref} position={position} scale={scale}>
        <extrudeGeometry args={[shape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 }]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
    </Float>
  );
}

function Teddy({
  position,
  speed,
  scale = 1,
  furColor = TEDDY_BROWN[0],
}: {
  position: [number, number, number];
  speed: number;
  scale?: number;
  furColor?: string;
}) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.5;
  });
  const furProps = { color: furColor, roughness: 0.75, metalness: 0 };
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.8}>
      <group ref={ref} position={position} scale={scale}>
        <mesh position={[0, -0.42, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial {...furProps} />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial {...furProps} />
        </mesh>
        <mesh position={[-0.24, 0.54, 0]}>
          <sphereGeometry args={[0.11, 10, 10]} />
          <meshStandardMaterial {...furProps} />
        </mesh>
        <mesh position={[0.24, 0.54, 0]}>
          <sphereGeometry args={[0.11, 10, 10]} />
          <meshStandardMaterial {...furProps} />
        </mesh>
        <mesh position={[-0.24, 0.54, 0.08]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FFE8C8" roughness={0.7} />
        </mesh>
        <mesh position={[0.24, 0.54, 0.08]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FFE8C8" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.4, 0.33]}>
          <sphereGeometry args={[0.22, 14, 14]} />
          <meshStandardMaterial color="#FFE8C8" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.18, 0.29]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color="#FFE8C8" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.15, 0.42]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#3a2417" roughness={0.4} />
        </mesh>
        <mesh position={[-0.42, -0.3, 0.08]} rotation={[0, 0, 0.5]}>
          <sphereGeometry args={[0.15, 10, 10]} />
          <meshStandardMaterial {...furProps} />
        </mesh>
        <mesh position={[0.42, -0.3, 0.08]} rotation={[0, 0, -0.5]}>
          <sphereGeometry args={[0.15, 10, 10]} />
          <meshStandardMaterial {...furProps} />
        </mesh>
        <mesh position={[-0.2, -0.72, 0.05]}>
          <sphereGeometry args={[0.16, 10, 10]} />
          <meshStandardMaterial {...furProps} />
        </mesh>
        <mesh position={[0.2, -0.72, 0.05]}>
          <sphereGeometry args={[0.16, 10, 10]} />
          <meshStandardMaterial {...furProps} />
        </mesh>
      </group>
    </Float>
  );
}

function Ribbon({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.22;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
    }
  });

  const bowShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.1);
    s.quadraticCurveTo(0.32, 0.52, 0.66, 0.3);
    s.quadraticCurveTo(0.48, 0.05, 0.66, -0.3);
    s.quadraticCurveTo(0.32, -0.52, 0, -0.1);
    s.quadraticCurveTo(-0.32, -0.52, -0.66, -0.3);
    s.quadraticCurveTo(-0.48, 0.05, -0.66, 0.3);
    s.quadraticCurveTo(-0.32, 0.52, 0, 0.1);
    s.closePath();
    return s;
  }, []);

  const tailShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.08, 0);
    s.lineTo(0.08, 0);
    s.lineTo(0.05, -0.42);
    s.lineTo(0, -0.32);
    s.lineTo(-0.05, -0.42);
    s.closePath();
    return s;
  }, []);

  const bowProps = { color, roughness: 0.25, metalness: 0.15 };
  const wingExtrude = { depth: 0.14, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025 };

  return (
    <Float speed={speed} rotationIntensity={0.7} floatIntensity={1.8}>
      <group ref={ref} position={position}>
        <mesh position={[0, 0, -0.07]}>
          <extrudeGeometry args={[bowShape, wingExtrude]} />
          <meshStandardMaterial {...bowProps} />
        </mesh>
        <mesh position={[-0.09, -0.12, -0.02]}>
          <extrudeGeometry args={[tailShape, { depth: 0.06, bevelEnabled: false }]} />
          <meshStandardMaterial {...bowProps} />
        </mesh>
        <mesh position={[0.09, -0.12, -0.02]}>
          <extrudeGeometry args={[tailShape, { depth: 0.06, bevelEnabled: false }]} />
          <meshStandardMaterial {...bowProps} />
        </mesh>
        <RoundedBox args={[0.2, 0.3, 0.2]} radius={0.05} position={[0, 0, 0.05]}>
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.25} />
        </RoundedBox>
      </group>
    </Float>
  );
}

function Hill({
  position,
  radius = 0.4,
  colorBase = "#6FCB86",
  colorHighlight = "#9BEAAE",
}: {
  position: [number, number, number];
  radius?: number;
  colorBase?: string;
  colorHighlight?: string;
}) {
  return (
    <group position={position}>
      <mesh scale={[1.5, 0.6, 1]} position={[0, -radius * 0.15, -0.06]}>
        <sphereGeometry args={[radius, 16, 12]} />
        <meshStandardMaterial color={colorBase} roughness={0.9} />
      </mesh>
      <mesh scale={[1, 0.55, 0.9]} position={[radius * 0.55, radius * 0.08, 0.05]}>
        <sphereGeometry args={[radius * 0.62, 14, 10]} />
        <meshStandardMaterial color={colorHighlight} roughness={0.85} />
      </mesh>
      <mesh scale={[1, 0.5, 0.85]} position={[-radius * 0.5, 0, 0.08]}>
        <sphereGeometry args={[radius * 0.5, 14, 10]} />
        <meshStandardMaterial color={colorHighlight} roughness={0.85} />
      </mesh>
    </group>
  );
}

function House({
  position,
  scale = 1,
  roofColor = "#E0665B",
  wallColor = "#FFF6E8",
}: {
  position: [number, number, number];
  scale?: number;
  roofColor?: string;
  wallColor?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <RoundedBox args={[0.32, 0.24, 0.28]} radius={0.02} position={[0, 0.12, 0]}>
        <meshStandardMaterial color={wallColor} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.32, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.26, 0.2, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.07, 0.141]}>
        <boxGeometry args={[0.08, 0.14, 0.02]} />
        <meshStandardMaterial color="#7a4a2e" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <pointLight position={[0, 0, 5]} intensity={0.35} color="#fff4d6" />

      <Teddy position={[-1.15, -0.2, 0]} speed={1.1} scale={1} />
      <Teddy position={[1.15, -0.2, -0.3]} speed={0.9} scale={0.85} furColor={TEDDY_BROWN[1]} />
      <HeadingBall from={[-1.15, 1.23, 0]} to={[1.15, 1.14, -0.3]} color={PALETTE[0]} height={0.3} duration={5.5} />
      <Star position={[-2.15, 1.1, -0.1]} color={PALETTE[4]} speed={1.8} />
      <Star position={[-1.85, 1.4, 0.15]} color={PALETTE[4]} speed={2.1} scale={0.45} />
      <Ribbon position={[2.2, 1.6, 0.35]} color={PALETTE[0]} speed={1.5} />
      <Block position={[2.05, -0.35, 0.2]} color={PALETTE[3]} speed={1.6} />

      <Hill position={[1.0, -2.05, -0.9]} radius={0.36} />
      <Hill position={[2.0, -1.75, -0.95]} radius={0.28} colorBase="#5FC97A" colorHighlight="#8FE0A0" />
      <House position={[1.7, -1.95, -0.65]} scale={0.8} />
      <House position={[1.15, -1.65, -0.7]} scale={0.65} roofColor="#6FD8FF" />
    </>
  );
}

export default function Banner3DScene() {
  return (
    <Canvas dpr={[1, 1.3]} camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <Scene />
    </Canvas>
  );
}
