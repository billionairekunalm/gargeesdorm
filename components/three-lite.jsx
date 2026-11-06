"use client";
/* Tiny replacements for the few @react-three/drei helpers we used, so the heavy drei bundle is not downloaded. */
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";

export function RoundedBox({ args = [1, 1, 1], radius = 0.05, smoothness = 4, children, ...props }) {
  const [w, h, d] = args;
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, Math.max(1, smoothness), Math.min(radius, Math.min(w, h, d) / 2 - 0.0005)), [w, h, d, radius, smoothness]);
  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} {...props}>{children}</mesh>;
}

/* soft studio reflections (same idea as drei's Environment + Lightformer, built once from a few glowing panels) */
export function Env({ size = 64 }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const s = new THREE.Scene();
    s.background = new THREE.Color("#1a1a1a");
    const panel = (w, h, pos, color, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m);
    };
    panel(10, 4, [0, 5, 5], "#ffffff", 2.2);
    panel(4, 6, [-6, 2, 2], "#cfe6ff", 1.4);
    panel(3, 5, [6, 1.5, 3], "#ffd9a6", 0.9);
    panel(5, 5, [0, 4, -3], "#ffffff", 1.4);
    const rt = pm.fromScene(s, 0.04);
    scene.environment = rt.texture;
    return () => { scene.environment = null; rt.dispose(); pm.dispose(); };
  }, [gl, scene, size]);
  return null;
}

/* drifting glow specks (replaces drei Sparkles) */
export function Dust({ count = 40, scale = [1, 1, 1], position = [0, 0, 0], size = 0.03, color = "#ffe2a6", opacity = 0.7, speed = 0.05 }) {
  const ref = useRef();
  const base = useMemo(() => Float32Array.from({ length: count * 3 }, (_, i) => (Math.random() - 0.5) * scale[i % 3]), [count, scale]);
  const arr = useMemo(() => base.slice(), [base]);
  useFrame(({ clock }) => {
    if (!ref.current || !count) return;
    const t = clock.elapsedTime, p = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      p.array[i * 3 + 1] = ((base[i * 3 + 1] + t * speed * (0.5 + (i % 5) * 0.2) + scale[1] / 2) % scale[1]) - scale[1] / 2;
      p.array[i * 3] = base[i * 3] + Math.sin(t * 0.4 + i) * 0.03;
    }
    p.needsUpdate = true;
  });
  if (!count) return null;
  return (
    <points ref={ref} position={position}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[arr, 3]} /></bufferGeometry>
      <pointsMaterial size={size} color={color} transparent opacity={opacity} depthWrite={false} sizeAttenuation />
    </points>
  );
}

/* drops quality when the device cannot keep ~35fps (replaces drei PerformanceMonitor) */
export function FpsGuard({ onDecline }) {
  const acc = useRef({ t: 0, n: 0, bad: 0 });
  useFrame((_, dt) => {
    const a = acc.current;
    if (dt > 0.25) return;           // ignore tab-switch gaps
    a.t += dt; a.n++;
    if (a.t >= 1.5) { const fps = a.n / a.t; a.bad = fps < 35 ? a.bad + 1 : 0; a.t = 0; a.n = 0; if (a.bad >= 2) { a.bad = -999; onDecline(); } }
  });
  return null;
}
