"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

const FLOORS = 12, H = 0.34, W = 1.7, D = 1.5, TARGET = 3; // index 3 = 4th floor

function useFacade() {
  return useMemo(() => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 64;
    const g = c.getContext("2d");
    g.fillStyle = "#f4efe6"; g.fillRect(0, 0, 256, 64);
    g.fillStyle = "#5d7690";
    for (let i = 0; i < 6; i++) g.fillRect(12 + i * 41, 14, 24, 32);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }, []);
}
const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

function Floors({ tex, t0, x = 0, z = 0, w = W, d = D, n = FLOORS, startDelay = 0 }) {
  const refs = useRef([]);
  useFrame(({ clock }) => {
    if (t0.current == null) return;
    const t = clock.elapsedTime - t0.current - startDelay;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const s = Math.max(0.001, ease((t - i * 0.14) / 0.6));
      m.scale.y = s; m.position.y = i * H + (H * s) / 2;
    });
  });
  return (
    <group position={[x, 0, z]}>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} ref={(m) => (refs.current[i] = m)} scale={[1, 0.001, 1]}>
          <boxGeometry args={[w, H, d]} />
          <meshStandardMaterial map={tex} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Glow({ t0 }) {
  const ring = useRef(), pin = useRef();
  useFrame(({ clock }) => {
    if (t0.current == null) return;
    const t = clock.elapsedTime - t0.current - 2.4;
    const k = ease(t / 0.8);
    const pulse = 0.6 + Math.sin(clock.elapsedTime * 3) * 0.4;
    ring.current.material.opacity = k * (0.35 + pulse * 0.35);
    pin.current.position.y = (TARGET + 0.5) * H + 0.5 + (1 - k) * 2 + Math.sin(clock.elapsedTime * 2.2) * 0.04;
    pin.current.visible = k > 0.01;
  });
  return (
    <>
      <mesh ref={ring} position={[0, (TARGET + 0.5) * H, 0]}>
        <boxGeometry args={[W + 0.1, H + 0.02, D + 0.1]} />
        <meshBasicMaterial color="#ed2024" transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={pin} position={[1.5, 3, 0.2]} visible={false}>
        <mesh rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.13, 0.32, 24]} /><meshStandardMaterial color="#ed2024" emissive="#ed2024" emissiveIntensity={0.6} /></mesh>
        <mesh position={[0, 0.2, 0]}><sphereGeometry args={[0.13, 24, 24]} /><meshStandardMaterial color="#ed2024" emissive="#ed2024" emissiveIntensity={0.6} /></mesh>
      </group>
    </>
  );
}

function Building({ active }) {
  const tex = useFacade();
  const root = useRef(), t0 = useRef(null);
  useFrame(({ clock, pointer }) => {
    if (active && t0.current == null) t0.current = clock.elapsedTime;
    root.current.rotation.y = -0.5 + Math.sin(clock.elapsedTime * 0.3) * 0.25 + pointer.x * 0.4;
  });
  const trees = [[-2.6, 1.7], [2.7, 1.5], [2.3, 2.3], [-1.4, 2.2]];
  return (
    <group ref={root}>
      <Floors tex={tex} t0={t0} />
      <Floors tex={tex} t0={t0} n={4} w={1.5} d={1.3} x={-1.5} z={0.35} startDelay={0.3} />
      <Floors tex={tex} t0={t0} n={3} w={2.2} d={1.2} x={-0.2} z={1.3} startDelay={0.5} />
      <mesh position={[-1.55, 0.7, 1.2]}>
        <cylinderGeometry args={[0.38, 0.38, 1.4, 28]} /><meshStandardMaterial color="#7fa3c4" metalness={0.6} roughness={0.2} />
      </mesh>
      {[[0.4, 0.5], [-0.3, -0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, FLOORS * H + 0.3, z]}><cylinderGeometry args={[0.015, 0.015, 0.6]} /><meshStandardMaterial color="#aaa" /></mesh>
      ))}
      <Glow t0={t0} />
      {trees.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.32, z]}><icosahedronGeometry args={[0.32, 1]} /><meshStandardMaterial color="#4f8a3c" roughness={1} flatShading /></mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 2.9]}><planeGeometry args={[9, 1]} /><meshStandardMaterial color="#6b6b72" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[4.6, 64]} /><meshStandardMaterial color="#e3dac8" /></mesh>
    </group>
  );
}

export default function Tower() {
  const wrap = useRef(); const [active, setActive] = useState(false); const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { setVis(e.isIntersecting); if (e.isIntersecting) setActive(true); }, { threshold: 0.2 });
    io.observe(wrap.current); return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className="tower-canvas" style={{ position: "relative" }} role="img" aria-label="3D animation of Bay View Tower with Gargee's Dormitory highlighted on the 4th floor">
      <Canvas frameloop={vis ? "always" : "never"} dpr={[1, 1.5]} camera={{ fov: 36, position: [7.4, 5.2, 10.2] }} onCreated={({ camera }) => camera.lookAt(0, 2.3, 0)}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 6, 5]} intensity={1.7} color="#fff4e0" />
        <Environment resolution={64}><Lightformer form="rect" intensity={2} position={[0, 5, 5]} scale={[10, 4, 1]} /></Environment>
        <Building active={active} />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
      </Canvas>
      <div className={`tower-tag badge${active ? " on" : ""}`}><b>Gargee&apos;s</b><span>4th Floor · Bay View Tower</span></div>
    </div>
  );
}
