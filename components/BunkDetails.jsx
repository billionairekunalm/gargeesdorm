"use client";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

const L = 1.02, Z = 0.46;
const steel = <meshStandardMaterial color="#f4f5f7" roughness={0.4} metalness={0.2} />;
const chrome = <meshStandardMaterial color="#cfd3d8" roughness={0.25} metalness={0.9} />;
const dark = <meshStandardMaterial color="#1b1b1f" roughness={0.7} />;
const gold = <meshStandardMaterial color="#d9a441" roughness={0.3} metalness={0.8} />;

function SwitchPlate({ position, big = true }) {
  return (
    <group position={position}>
      <RoundedBox args={[big ? 0.34 : 0.14, 0.15, 0.022]} radius={0.012} smoothness={3}><meshStandardMaterial color="#f7f7f5" roughness={0.35} /></RoundedBox>
      {big && [-0.115, -0.055, 0.005].map((x, i) => (
        <group key={x} position={[x, 0.012, 0.012]}>
          <RoundedBox args={[0.042, 0.075, 0.008]} radius={0.004}><meshStandardMaterial color="#ececec" roughness={0.3} /></RoundedBox>
          <mesh position={[0, 0.02, 0.006]} rotation={[-0.25, 0, 0]}><boxGeometry args={[0.034, 0.03, 0.004]} /><meshStandardMaterial color="#fafafa" /></mesh>
          {i === 0 && <mesh position={[0, -0.05, 0.002]}><sphereGeometry args={[0.005, 8, 8]} /><meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={1.4} /></mesh>}
        </group>
      ))}
      {big ? (
        <group position={[0.115, 0, 0.012]}>
          <mesh><circleGeometry args={[0.052, 24]} /><meshStandardMaterial color="#dcdcdc" /></mesh>
          {[[0, 0.018], [-0.016, -0.012], [0.016, -0.012]].map(([x, y], i) => <mesh key={i} position={[x, y, 0.002]}><circleGeometry args={[0.0065, 10]} /><meshStandardMaterial color="#222" /></mesh>)}
        </group>
      ) : (
        <mesh position={[0, 0, 0.013]}><boxGeometry args={[0.04, 0.07, 0.006]} /><meshStandardMaterial color="#ececec" /></mesh>
      )}
    </group>
  );
}

/* phone charger + hanging cable on the lower socket */
function Charger() {
  const cable = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.01, -0.12, 0.05), new THREE.Vector3(-0.02, -0.3, 0.08), new THREE.Vector3(0.03, -0.42, 0.1)]), 20, 0.004, 6), []);
  return (
    <group position={[-0.6, 0.9, -0.43]}>
      <RoundedBox args={[0.05, 0.05, 0.05]} radius={0.008}><meshStandardMaterial color="#fff" roughness={0.3} /></RoundedBox>
      <mesh geometry={cable} position={[0, -0.03, 0.02]}>{dark}</mesh>
    </group>
  );
}

export default function BunkDetails() {
  const ringXs = useMemo(() => Array.from({ length: 15 }, (_, i) => -0.4 + i * 0.065), []);
  return (
    <group>
      {/* curtain rod with brackets and rings, along the upper bunk's front rail */}
      <mesh position={[0.06, 1.455, 0.54]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.011, 0.011, 1.0, 12]} />{chrome}</mesh>
      {[-0.44, 0.56].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.455, 0.5]}><boxGeometry args={[0.018, 0.018, 0.09]} />{chrome}</mesh>
          <mesh position={[x - 0.004, 1.455, 0.545]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.018, 0.018, 0.012, 14]} />{gold}</mesh>
        </group>
      ))}
      {ringXs.map((x) => <mesh key={x} position={[x, 1.455, 0.54]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.02, 0.0042, 8, 18]} />{chrome}</mesh>)}

      {/* wall switch + socket plates (lower and upper bunk), charger and cable */}
      <SwitchPlate position={[-0.72, 0.9, -0.466]} />
      <SwitchPlate position={[-0.78, 1.88, -0.466]} big={false} />
      <Charger />

      {/* mattress edge piping */}
      {[0.48, 1.48].map((y) => (
        <group key={y}>
          <RoundedBox args={[1.995, 0.014, 0.905]} radius={0.006} position={[0, y + 0.082, 0]}><meshStandardMaterial color="#e7eaef" roughness={0.9} /></RoundedBox>
          <RoundedBox args={[1.995, 0.012, 0.905]} radius={0.006} position={[0, y - 0.04, 0]}><meshStandardMaterial color="#e7eaef" roughness={0.9} /></RoundedBox>
        </group>
      ))}

      {/* bolts at frame joints */}
      {[[-L, 0.4], [-L, 1.4], [L, 0.4], [L, 1.4]].flatMap(([x, y]) => [Z, -Z].map((z) => (
        <mesh key={`${x}${y}${z}`} position={[x + (x < 0 ? -0.036 : 0.036), y, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.011, 0.011, 0.01, 8]} />{chrome}</mesh>
      )))}
      {/* rubber feet */}
      {[[-L, -Z], [-L, Z], [L, -Z], [L, Z]].map(([x, z]) => <mesh key={`${x}${z}`} position={[x, 0.012, z]}><cylinderGeometry args={[0.045, 0.05, 0.024, 14]} />{dark}</mesh>)}
      {/* ladder grab handle above the top rung */}
      <mesh position={[0.66, 1.66, Z + 0.01]}><boxGeometry args={[0.045, 0.52, 0.05]} />{steel}</mesh>
      <mesh position={[0.94, 1.66, Z + 0.01]}><boxGeometry args={[0.045, 0.52, 0.05]} />{steel}</mesh>
      <mesh position={[0.8, 1.9, Z + 0.01]}><boxGeometry args={[0.32, 0.04, 0.05]} />{steel}</mesh>
      {/* ladder rubber end caps */}
      {[0.66, 0.94].map((x) => <mesh key={x} position={[x, 0.012, Z + 0.01]}><cylinderGeometry args={[0.03, 0.034, 0.024, 12]} />{dark}</mesh>)}
      {/* bed number plaque on the front post */}
      <RoundedBox args={[0.06, 0.04, 0.012]} radius={0.004} position={[-L, 1.0, Z + 0.04]}>{gold}</RoundedBox>
      {/* personal locker key tag hanging from the upper rail */}
      <mesh position={[-0.5, 1.8, Z + 0.035]}><boxGeometry args={[0.018, 0.06, 0.004]} />{gold}</mesh>
    </group>
  );
}
