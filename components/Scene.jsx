"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles, PerformanceMonitor } from "@react-three/drei";
import { Bunk, AC } from "./BunkModel";
import { ExtraBeds, SeaWindow } from "./RoomExtras";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

const { clamp, damp, smoothstep, lerp } = THREE.MathUtils;

/* phones: keep the whole bunk in view (top half) instead of zooming into the curtain */
const POSES_M = [
  { p: [1.4, 1.75, 5.9], l: [-0.85, 1.2, 0] },
  { p: [-1.6, 1.7, 5.0], l: [0.1, 1.05, 0] },
  { p: [0.5, 1.45, 3.15], l: [0, 1.0, 0] },
  { p: [-5.2, 1.6, 3.8], l: [-5.2, 1.3, -0.5] },
];

/* Camera poses per scroll stage: hero start -> hero end -> bunk end -> sea end */
const POSES = [
  { p: [1.4, 1.75, 5.9], l: [-0.85, 1.2, 0] },
  { p: [-1.6, 1.7, 5.0], l: [0.1, 1.05, 0] },
  { p: [0.9, 1.1, 3.1], l: [-0.1, 0.95, 0.2] },
  { p: [-4.7, 1.55, 5.7], l: [-5.1, 1.3, -0.5] },
];

function Room() {
  const { floorTex, wallTex, plasterTex } = useMemo(() => {
    const L = new THREE.TextureLoader();
    const mk = (u, r) => { const t = L.load(u); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...r); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    return { floorTex: mk("/tex/floor.jpg", [7, 5]), wallTex: mk("/tex/wall.jpg", [1, 1]), plasterTex: mk("/tex/plaster.jpg", [5, 3]) };
  }, []);
  const wall = <meshStandardMaterial bumpMap={plasterTex} bumpScale={0.6} color="#f4ead7" roughness={0.95} />;
  const frame = <meshStandardMaterial color="#ffffff" roughness={0.5} />;
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.5, 0, 1.5]}>
        <planeGeometry args={[26, 10]} />
        <meshStandardMaterial map={floorTex} color="#ffffff" roughness={0.6} />
      </mesh>
      {/* wall pieces around window (window x -4.1..-1.9, y .7..2.2) */}
      <mesh position={[-9.25, 1.5, -0.55]}><boxGeometry args={[3.9, 3, 0.1]} />{wall}</mesh>
      <mesh position={[1.45, 1.5, -0.55]}><boxGeometry args={[13, 3, 0.1]} />{wall}</mesh>
      <mesh position={[-6.2, 0.35, -0.55]}><boxGeometry args={[2.2, 0.7, 0.1]} />{wall}</mesh>
      <mesh position={[-6.2, 2.6, -0.55]}><boxGeometry args={[2.2, 0.8, 0.1]} />{wall}</mesh>
      <mesh position={[-2, 6.5, -0.55]}><boxGeometry args={[30, 7, 0.1]} />{wall}</mesh>
      {/* olive panel behind beds */}
      <mesh position={[0, 1.0, -0.49]}><boxGeometry args={[2.4, 2.0, 0.04]} /><meshStandardMaterial map={wallTex} color="#ffffff" roughness={0.7} /></mesh>
      {/* window frame */}
      {[[-6.2, 2.2, 2.3, 0.1], [-6.2, 0.7, 2.3, 0.1]].map(([x, y, w, h], i) => <mesh key={i} position={[x, y, -0.5]}><boxGeometry args={[w, h, 0.14]} />{frame}</mesh>)}
      {[-7.3, -5.1].map((x) => <mesh key={x} position={[x, 1.45, -0.5]}><boxGeometry args={[0.1, 1.6, 0.14]} />{frame}</mesh>)}
      <mesh position={[-6.2, 1.45, -0.5]}><boxGeometry args={[0.04, 1.5, 0.12]} />{frame}</mesh>
      <SeaWindow x={-6.2} />
      <pointLight position={[-6.2, 1.5, 0.6]} color="#ffd9a8" intensity={3} distance={5} />
    </group>
  );
}

/* weak devices: drive the render loop ourselves at 30fps (steadier than an uneven 60) and only while the 3D is on screen */
function Throttle({ run, fps = 30 }) {
  const { advance } = useThree();
  useEffect(() => {
    if (!run) return;
    let id, last = 0;
    const loop = (t) => { id = requestAnimationFrame(loop); if (t - last >= 1000 / fps - 2) { last = t; advance(t / 1000); } };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [run, fps, advance]);
  return null;
}

function Rig() {
  const { size, camera, pointer } = useThree();
  const bed = useRef(), curtain = useRef(0.8), reveal = useRef(0);
  const stages = useRef([]);
  const fs = useRef(0);
  const look = useRef(new THREE.Vector3());
  const { scene } = useThree();
  useEffect(() => {
    const id = setTimeout(() => scene.traverse((m) => { if (m.isMesh && !m.material?.isShaderMaterial && !m.material?.transparent) { m.castShadow = true; m.receiveShadow = true; } }), 400);
    return () => clearTimeout(id);
  }, [scene]);
  const [showExtra, setShowExtra] = useState(false);
  useEffect(() => {
    // mount the extra beds in a quiet moment shortly after load (they stay hidden until the sea section)
    const ric = window.requestIdleCallback || ((f) => setTimeout(f, 2200));
    const id = ric(() => setShowExtra(true), { timeout: 4000 });
    return () => { (window.cancelIdleCallback || clearTimeout)(id); };
  }, []);
  useEffect(() => {
    // measure the three 3D sections once (and on resize / layout change) instead of reading layout every frame
    const measure = () => {
      stages.current = ["hero", "bunk", "sea"].map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, span: Math.max(1, r.height - (el.dataset.sticky ? window.innerHeight : 0)) };
      });
    };
    measure();
    const t1 = setTimeout(measure, 1200), t2 = setTimeout(measure, 4000);
    const ro = new ResizeObserver(measure); ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(t1); clearTimeout(t2); ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  useFrame(({ clock }, dt) => {
    let f = 0;
    const y = window.scrollY;
    for (const st of stages.current) { if (st) f += clamp((y - st.top) / st.span, 0, 1); }
    fs.current = damp(fs.current, f, 5, dt);
    const s = fs.current;
    const i = Math.min(2, Math.floor(s)), t = smoothstep(s - i, 0, 1);
    const narrow = size.width < 820;
    const PS = narrow ? POSES_M : POSES;
    const A = PS[i], B = PS[i + 1];
    const heroMix = 1 - clamp(s, 0, 1);
    const zoom = narrow ? lerp(1.5, 2.15, smoothstep(s, 0.45, 1)) : 1; // phones: bed fills the screen in the hero, then pulls back
    const p = A.p.map((v, k) => lerp(v, B.p[k], t));
    const l = A.l.map((v, k) => lerp(v, B.l[k], t));
    // phones: bed sits low under the headline in hero, centred elsewhere
    const heroW = 1 - clamp(s, 0, 1);
    if (narrow) {
      // park the bed in the lower ~third of the screen (text sits above it); upper third once past the hero
      const dist = Math.hypot(p[0] - l[0], p[1] - l[1], (p[2] * zoom) - l[2]);
      const h = 2 * dist * Math.tan(THREE.MathUtils.degToRad(19));
      l[0] = lerp(l[0], 0, heroW);
      l[1] += 0.3 * h * heroW - 0.2 * h * (1 - heroW);
    }
    camera.position.set(p[0] + pointer.x * 0.25, p[1] + pointer.y * 0.12, (p[2] - 0.0) * zoom + (narrow ? 0 : 0));
    look.current.set(l[0], l[1], l[2]);
    camera.lookAt(look.current);
    // bed: gentle float + rotate while scrolling hero
    if (bed.current) {
      bed.current.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.025;
      bed.current.rotation.y = lerp(-0.35, 0.05, smoothstep(s, 0, 1)) + Math.sin(clock.elapsedTime * 0.35) * 0.04;
    }
    // curtain: tied back -> drawn closed while in bunk stage -> reopens
    const target = s < 1.2 ? 0.95 : s < 1.75 ? 0.0 : 0.95;
    curtain.current = damp(curtain.current, target, 3, dt);
    reveal.current = damp(reveal.current, s > 1.7 ? 1 : 0, 3, dt); // extra beds rise as the camera reaches the sea window
  });

  return (
    <>
      <group ref={bed}>
        <Bunk curtainOpen={curtain} />
      </group>
      <AC />
      {showExtra && <ExtraBeds reveal={reveal} />}
      <Room />
    </>
  );
}

export default function Scene() {
  const [low, setLow] = useState(null);      // null until measured on the client
  const [active, setActive] = useState(true);
  useEffect(() => {
    const weak = window.innerWidth < 820 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
    setLow(weak);
  }, []);
  useEffect(() => {
    // stop rendering while the visitor is scrolled into the opaque sections (nothing of the 3D scene is visible there)
    const ids = ["hero", "bunk", "sea"], on = new Set();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? on.add(e.target.id) : on.delete(e.target.id)));
      setActive(on.size > 0);
    }, { rootMargin: "120px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  if (low === null) return <div className="scene" aria-hidden="true" />;

  return (
    <div className="scene" aria-hidden="true">
      <Canvas frameloop={low ? "never" : active ? "always" : "never"} dpr={low ? [1, 1.25] : [1, 1.5]} camera={{ fov: 38, position: [1.4, 1.6, 5.4] }} shadows gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.15; }}>
        <PerformanceMonitor onDecline={() => setLow(true)} />
        {low && <Throttle run={active} fps={30} />}
        <color attach="background" args={["#f5ebd9"]} />
        <ambientLight intensity={0.95} />
        <hemisphereLight args={["#fff6e8", "#d9c9a8", 0.8]} />
        <directionalLight position={[3, 5, 4]} intensity={2.6} color="#fff1d6" castShadow shadow-mapSize={low ? [512, 512] : [1024, 1024]} shadow-bias={-0.0006} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-3} />
        <Environment resolution={low ? 32 : 64}>
          <Lightformer form="rect" intensity={2.2} position={[0, 5, 5]} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={1.4} position={[-6, 2, 2]} scale={[4, 6, 1]} color="#cfe6ff" />
          <Lightformer form="rect" intensity={0.9} position={[6, 1.5, 3]} scale={[3, 5, 1]} color="#ffd9a6" />
          <Lightformer form="ring" intensity={1.4} position={[0, 4, -3]} scale={5} color="#ffffff" />
        </Environment>
        <Rig />
        <Sparkles count={low ? 0 : 30} scale={[9, 4, 6]} position={[-1, 2, 1]} size={2.2} speed={0.25} color="#ffe2a6" opacity={0.7} />
      </Canvas>
    </div>
  );
}
