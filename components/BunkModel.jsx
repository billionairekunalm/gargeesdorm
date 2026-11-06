"use client";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Dust } from "./three-lite";
import * as THREE from "three";
import { createContext, useContext, useMemo, useRef } from "react";
const LiteCtx = createContext(false);
import BunkDetails from "./BunkDetails";

/* ---------- procedural textures (no files) ---------- */
function canvasTex(w, h, draw, repeat = [1, 1], srgb = true) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const noise = (g, w, h, n, a) => { for (let i = 0; i < n; i++) { const v = (Math.random() * 255) | 0; g.fillStyle = `rgba(${v},${v},${v},${a})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } };

const loader = typeof window !== "undefined" ? new THREE.TextureLoader() : null;
const photo = (url, rep = [1, 1], srgb = true) => {
  const t = loader.load(url); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
};

/* materials are cut from the owner's REAL photos (public/tex/*.jpg) so fabric, sheets and curtain look like the real thing */
export function useTextures() {
  return useMemo(() => {
    const fabricBump = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); noise(g, w, h, 4000, 0.35); }, [6, 6], false);
    return {
      linen: photo("/tex/sheet.jpg", [1.4, 1]),
      sheetBump: photo("/tex/sheet.jpg", [1.4, 1], false),
      wool: photo("/tex/blanket.jpg", [1, 1]),
      curtain: canvasTex(256, 256, (g, w, h) => {
        const gr = g.createLinearGradient(0, 0, w, 0);
        for (let i = 0; i <= 16; i++) { const t = i / 16, v = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 4); gr.addColorStop(t, `rgb(${Math.round(226 + 18 * v)},${Math.round(176 + 20 * v)},${Math.round(116 + 26 * v)})`); }
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
        g.fillStyle = "rgba(255,240,210,.10)"; for (let x = 0; x < w; x += 3) g.fillRect(x, 0, 1, h);   // fine thread lines
        const sh = g.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, "rgba(120,70,20,.18)"); sh.addColorStop(0.3, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(120,70,20,.10)");
        g.fillStyle = sh; g.fillRect(0, 0, w, h);
      }, [1, 1]),
      fabricBump,
    };
  }, []);
}

const paint = { color: "#f4f5f7", roughness: 0.42, metalness: 0.15 };

/* square steel tube between two points */
function Beam({ a, b, w = 0.055, d = 0.055 }) {
  const lite = useContext(LiteCtx);
  const { pos, quat, len } = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), dir = B.clone().sub(A);
    return { pos: A.clone().add(B).multiplyScalar(0.5), quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), len: dir.length() };
  }, [a, b]);
  if (lite) return <mesh position={pos} quaternion={quat}><boxGeometry args={[w, len, d]} /><meshStandardMaterial {...paint} /></mesh>;
  return (
    <RoundedBox args={[w, len, d]} radius={Math.min(w, d) * 0.3} smoothness={2} position={pos} quaternion={quat}>
      <meshStandardMaterial {...paint} />
    </RoundedBox>
  );
}

function Curtain({ open, frozen }) {
  const lite = useContext(LiteCtx);
  const done = useRef(false);
  const { curtain: curtainMap, fabricBump: bump } = useTextures();
  const band = useRef();
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.92, 1.02, lite ? 26 : 72, lite ? 12 : 36);
    g.userData.base = g.attributes.position.array.slice();
    return g;
  }, []);
  useFrame(({ clock }) => {
    if (frozen && done.current) return;
    done.current = true;
    const t = frozen ? 0 : clock.elapsedTime, o = open.current;
    const pos = geo.attributes.position, base = geo.userData.base, TIE = -0.13;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1];
      const tie = Math.exp(-(((by - TIE) / 0.12) ** 2));
      const flare = Math.max(0, TIE - by) * 0.55;                  // hem flares out below the tie
      const x = bx * (1 - o * (0.14 + 0.5 * tie) + o * flare);
      const amp = 0.018 + 0.05 * o * (0.35 + tie) + 0.02 * Math.max(0, TIE - by) * o;
      const pleat = Math.sin(x * 36 + Math.sin(by * 5) * 0.4) * amp;
      const sway = Math.sin(t * 1.1 + by * 3 + bx * 2) * 0.006 * (0.55 - by);
      pos.setXYZ(i, x, by, pleat + sway + (0.05 * (1 - o) * (0.5 - by)) * 0.2);
    }
    pos.needsUpdate = true; geo.computeVertexNormals();
    if (band.current) { band.current.scale.x = 0.92 * (1 - o * 0.64) + 0.07; band.current.visible = o > 0.15; band.current.position.z = 0.04 + 0.05 * o; }
  });
  return (
    <group position={[0.05, 0.96, 0.55]}>
      <mesh geometry={geo}>
        <meshStandardMaterial map={curtainMap} color="#ffffff" roughness={0.85} side={THREE.DoubleSide} bumpMap={bump} bumpScale={0.35} />
      </mesh>
      <mesh ref={band} position={[0, -0.13, 0.08]}>
        <boxGeometry args={[1, 0.06, 0.07]} />
        <meshStandardMaterial color="#f3d5a3" roughness={0.9} />
      </mesh>
    </group>
  );
}

const pillowGeo = (() => {
  const g = new THREE.BoxGeometry(0.54, 0.15, 0.38, 22, 6, 16), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const e = Math.min(1, Math.max(Math.abs(x) / 0.27, Math.abs(z) / 0.19));       // 0 centre .. 1 edge
    const belly = 1 - Math.pow(e, 3) * 0.62;                                          // dome in the middle, thin pinched edge
    p.setY(i, y * belly + (y > 0 ? 0.015 * (1 - e) : 0));
    const k = 1 - 0.07 * Math.pow(Math.abs(y) / 0.075, 2) * 0;                        // keep footprint
    p.setX(i, x * k); p.setZ(i, z * k);
  }
  g.computeVertexNormals();
  return g;
})();
function Pillow({ position, rotation = [0, 0, 0], scale = 1, bump, map }) {
  return (
    <mesh geometry={pillowGeo} position={position} rotation={rotation} scale={scale} castShadow>
      <meshStandardMaterial map={map} color="#ffffff" roughness={0.95} bumpMap={bump} bumpScale={0.5} />
    </mesh>
  );
}

function Blanket({ position, rotation = [0, 0, 0], wool, bump }) {
  return (
    <group position={position} rotation={rotation}>
      {[0, 1, 2].map((i) => (
        <RoundedBox key={i} args={[0.64 - i * 0.012, 0.034, 0.7 - i * 0.01]} radius={0.015} smoothness={3} position={[i * 0.004, 0.02 + i * 0.032, 0]}>
          <meshStandardMaterial map={wool} roughness={1} bumpMap={bump} bumpScale={0.8} color={i === 2 ? "#ffffff" : "#e9d6b0"} />
        </RoundedBox>
      ))}
    </group>
  );
}

export function Bunk({ curtainOpen, lite = false }) {
  const { linen, fabricBump, sheetBump, wool } = useTextures();
  const L = 1.02, Z = 0.46;
  return (
    <LiteCtx.Provider value={lite}><group>
      {/* posts */}
      {[[-L, -Z], [-L, Z], [L, -Z], [L, Z]].map(([x, z], i) => <Beam key={i} a={[x, 0, z]} b={[x, 2.05, z]} w={0.07} d={0.07} />)}
      {/* side + end rails for both bunks (thicker side rails like real dorm frames) */}
      {[0.4, 1.4].map((y) => (
        <group key={y}>
          <Beam a={[-L, y, Z]} b={[L, y, Z]} w={0.06} d={0.05} />
          <Beam a={[-L, y, -Z]} b={[L, y, -Z]} w={0.06} d={0.05} />
          <Beam a={[-L, y, -Z]} b={[-L, y, Z]} w={0.06} d={0.05} />
          <Beam a={[L, y, -Z]} b={[L, y, Z]} w={0.06} d={0.05} />
          {[-0.5, 0, 0.5].map((x) => <Beam key={x} a={[x, y - 0.01, -Z]} b={[x, y - 0.01, Z]} w={0.03} d={0.03} />)}
        </group>
      ))}
      {/* upper guard rail frame (as on the real beds) */}
      <Beam a={[-L, 1.88, Z]} b={[0.45, 1.88, Z]} w={0.05} d={0.05} />
      <Beam a={[-L, 1.68, Z]} b={[0.45, 1.68, Z]} w={0.04} d={0.04} />
      <Beam a={[0.45, 1.4, Z]} b={[0.45, 1.88, Z]} w={0.05} d={0.05} />
      {/* ladder in the front plane */}
      <Beam a={[0.66, 0, Z + 0.01]} b={[0.66, 1.4, Z + 0.01]} w={0.045} d={0.05} />
      <Beam a={[0.94, 0, Z + 0.01]} b={[0.94, 1.4, Z + 0.01]} w={0.045} d={0.05} />
      {[0.32, 0.66, 1.0, 1.3].map((y) => <Beam key={y} a={[0.66, y, Z + 0.01]} b={[0.94, y, Z + 0.01]} w={0.035} d={0.05} />)}
      {/* mattresses with tucked sheets */}
      {[0.48, 1.48].map((y, i) => (
        <group key={y}>
          <RoundedBox args={[1.98, 0.16, 0.9]} radius={0.05} smoothness={4} position={[0, y, 0]} castShadow receiveShadow>
            <meshStandardMaterial map={linen} roughness={0.92} bumpMap={sheetBump} bumpScale={0.5} />
          </RoundedBox>
          <RoundedBox args={[2.03, 0.05, 0.95]} radius={0.02} smoothness={3} position={[0, y - 0.07, 0]}>
            <meshStandardMaterial map={linen} roughness={0.95} />
          </RoundedBox>
          {i === 0 ? (
            <>
              <Pillow position={[0.55, y + 0.15, 0.02]} rotation={[0, 0.2, 0.1]} bump={fabricBump} map={linen} />
              <Pillow position={[0.62, y + 0.27, -0.04]} rotation={[0.1, -0.3, -0.2]} scale={0.92} bump={fabricBump} map={linen} />
              <Blanket position={[-0.55, y + 0.08, 0.02]} rotation={[0, 0.12, 0]} wool={wool} bump={fabricBump} />
              <RoundedBox args={[0.055, 0.016, 0.175]} radius={0.006} position={[-0.5, y + 0.22, 0.02]} rotation={[0, 0.35, 0]}>
                <meshStandardMaterial color="#ffffff" roughness={0.4} />
              </RoundedBox>
              <mesh position={[-0.5, y + 0.23, -0.03]} rotation={[0, 0.35, 0]}><boxGeometry args={[0.03, 0.004, 0.025]} /><meshStandardMaterial color="#1b2a1b" emissive="#7fe08a" emissiveIntensity={0.6} /></mesh>
            </>
          ) : (
            <>
              <Pillow position={[-0.78, y + 0.15, 0.02]} rotation={[0, 0.05, 0.05]} bump={fabricBump} map={linen} />
              <Blanket position={[0.62, y + 0.08, -0.02]} rotation={[0, -0.15, 0]} wool={wool} bump={fabricBump} />
            </>
          )}
        </group>
      ))}
      {/* strip light under the top bunk */}
      <mesh position={[-0.1, 1.33, -0.42]}>
        <boxGeometry args={[1.5, 0.03, 0.05]} />
        <meshStandardMaterial color="#fff6d8" emissive="#ffe6a8" emissiveIntensity={2.6} />
      </mesh>
      <pointLight position={[-0.1, 1.15, 0.05]} color="#ffdca0" intensity={2.4} distance={2.4} />
      {/* switch + socket plate on the wall */}
      <group position={[-0.72, 0.9, -0.465]}>
        <RoundedBox args={[0.3, 0.14, 0.02]} radius={0.01}><meshStandardMaterial color="#f6f6f6" roughness={0.4} /></RoundedBox>
        {[-0.09, -0.03, 0.03].map((x) => <mesh key={x} position={[x, 0.01, 0.012]}><boxGeometry args={[0.04, 0.07, 0.006]} /><meshStandardMaterial color="#e5e5e5" /></mesh>)}
        <mesh position={[0.1, 0, 0.012]}><circleGeometry args={[0.04, 20]} /><meshStandardMaterial color="#d8d8d8" /></mesh>
      </group>
      {!lite && <BunkDetails />}
      <Curtain open={curtainOpen} frozen={lite} />
    </group></LiteCtx.Provider>
  );
}

export function AC({ lite = false }) {
  const led = useRef();
  useFrame(({ clock }) => { if (led.current) led.current.emissiveIntensity = 1.4 + Math.sin(clock.elapsedTime * 3) * 0.8; });
  return (
    <group position={[0.15, 2.42, -0.36]}>
      <RoundedBox args={[1.12, 0.33, 0.24]} radius={0.05} smoothness={5}>
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.05} />
      </RoundedBox>
      <mesh position={[0, 0.07, 0.122]}><boxGeometry args={[1.0, 0.012, 0.004]} /><meshStandardMaterial color="#dfe4ea" /></mesh>
      <mesh position={[0, -0.1, 0.1]}><boxGeometry args={[0.98, 0.07, 0.1]} /><meshStandardMaterial color="#c9cfd6" roughness={0.6} /></mesh>
      {[-0.025, 0, 0.025].map((y) => <mesh key={y} position={[0, -0.1 + y, 0.152]}><boxGeometry args={[0.94, 0.006, 0.004]} /><meshStandardMaterial color="#8d949c" /></mesh>)}
      <mesh position={[-0.36, 0.06, 0.124]}><boxGeometry args={[0.2, 0.05, 0.003]} /><meshStandardMaterial color="#e6322b" /></mesh>
      <mesh position={[0.42, 0.03, 0.124]}><sphereGeometry args={[0.014, 12, 12]} /><meshStandardMaterial ref={led} color="#58b8ff" emissive="#58b8ff" emissiveIntensity={2} /></mesh>
      {/* refrigerant pipes */}
      <mesh position={[0.82, 0.05, -0.02]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.035, 0.5, 14]} /><meshStandardMaterial color="#f1f1ee" roughness={0.7} /></mesh>
      <mesh position={[1.07, -0.42, -0.02]}><cylinderGeometry args={[0.035, 0.035, 1.0, 14]} /><meshStandardMaterial color="#f1f1ee" roughness={0.7} /></mesh>
      {!lite && <Dust count={24} scale={[1.2, 0.8, 0.7]} position={[0, -0.55, 0.3]} size={0.02} speed={0.12} color="#9fd8ff" />}
    </group>
  );
}
