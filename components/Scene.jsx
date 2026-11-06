"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, Sparkles } from "@react-three/drei";
import { Bunk, AC } from "./BunkModel";
import { EffectComposer, N8AO, Bloom, Vignette, SMAA, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";

const { clamp, damp, smoothstep, lerp } = THREE.MathUtils;

/* Camera poses per scroll stage: hero start -> hero end -> bunk end -> sea end */
const POSES = [
  { p: [1.4, 1.75, 5.9], l: [-0.85, 1.2, 0] },
  { p: [-1.6, 1.7, 5.0], l: [0.1, 1.05, 0] },
  { p: [0.7, 0.95, 2.25], l: [-0.25, 0.75, 0.2] },
  { p: [-4.9, 1.5, 3.6], l: [-6.1, 1.4, -0.6] },
];

const seaFrag = `
varying vec2 vUv; uniform float uTime;
void main(){
  vec2 uv=vUv; float h=0.42;
  vec3 sky=mix(vec3(1.0,0.82,0.66),vec3(0.42,0.68,0.95),smoothstep(h,1.0,uv.y));
  float d=distance(uv*vec2(1.5,1.0),vec2(1.05,0.6));
  sky+=vec3(1.0,0.78,0.45)*smoothstep(0.16,0.0,d)*1.4;
  float k=uv.y/h;
  float w=sin(uv.x*46.0+uTime*1.4+sin(uv.y*34.0+uTime))*0.5+0.5;
  vec3 sea=mix(vec3(0.03,0.28,0.52),vec3(0.25,0.66,0.85),k)+w*0.07*(1.0-k);
  sea+=vec3(1.0,0.8,0.5)*smoothstep(0.25,0.0,abs(uv.x-0.7))*pow(w,5.0)*0.7*(1.0-k);
  vec3 col=uv.y>h?sky:sea;
  gl_FragColor=vec4(col,1.0);
  #include <colorspace_fragment>
}`;

function Room() {
  const mat = useRef();
  const { floorTex, wallTex, plasterTex } = useMemo(() => {
    const L = new THREE.TextureLoader();
    const mk = (u, r) => { const t = L.load(u); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...r); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    return { floorTex: mk("/tex/floor.jpg", [7, 5]), wallTex: mk("/tex/wall.jpg", [1, 1]), plasterTex: mk("/tex/plaster.jpg", [5, 3]) };
  }, []);
  useFrame(({ clock }) => { mat.current.uniforms.uTime.value = clock.elapsedTime; });
  const wall = <meshStandardMaterial bumpMap={plasterTex} bumpScale={0.6} color="#f4ead7" roughness={0.95} />;
  const frame = <meshStandardMaterial color="#ffffff" roughness={0.5} />;
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.5, 0, 1.5]}>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial map={floorTex} color="#ffffff" roughness={0.6} />
      </mesh>
      {/* wall pieces around window (window x -4.1..-1.9, y .7..2.2) */}
      <mesh position={[-9.25, 1.5, -0.55]}><boxGeometry args={[3.9, 3, 0.1]} />{wall}</mesh>
      <mesh position={[-1.05, 1.5, -0.55]}><boxGeometry args={[8.1, 3, 0.1]} />{wall}</mesh>
      <mesh position={[-6.2, 0.35, -0.55]}><boxGeometry args={[2.2, 0.7, 0.1]} />{wall}</mesh>
      <mesh position={[-6.2, 2.6, -0.55]}><boxGeometry args={[2.2, 0.8, 0.1]} />{wall}</mesh>
      {/* olive panel behind beds */}
      <mesh position={[0, 1.0, -0.49]}><boxGeometry args={[2.4, 2.0, 0.04]} /><meshStandardMaterial map={wallTex} color="#ffffff" roughness={0.7} /></mesh>
      {/* window frame */}
      {[[-6.2, 2.2, 2.3, 0.1], [-6.2, 0.7, 2.3, 0.1]].map(([x, y, w, h], i) => <mesh key={i} position={[x, y, -0.5]}><boxGeometry args={[w, h, 0.14]} />{frame}</mesh>)}
      {[-7.3, -5.1].map((x) => <mesh key={x} position={[x, 1.45, -0.5]}><boxGeometry args={[0.1, 1.6, 0.14]} />{frame}</mesh>)}
      <mesh position={[-6.2, 1.45, -0.5]}><boxGeometry args={[0.04, 1.5, 0.12]} />{frame}</mesh>
      {/* sea backdrop */}
      <mesh position={[-6.2, 1.45, -1.4]}>
        <planeGeometry args={[4.6, 3.2]} />
        <shaderMaterial ref={mat} uniforms={{ uTime: { value: 0 } }} vertexShader="varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}" fragmentShader={seaFrag} />
      </mesh>
      <pointLight position={[-6.2, 1.5, 0.6]} color="#ffd9a8" intensity={3} distance={5} />
    </group>
  );
}

function Rig() {
  const { size, camera, pointer } = useThree();
  const bed = useRef(), curtain = useRef(0.8);
  const stages = useRef([]);
  const fs = useRef(0);
  const look = useRef(new THREE.Vector3());
  const { scene } = useThree();
  useEffect(() => {
    const id = setTimeout(() => scene.traverse((m) => { if (m.isMesh && !m.material?.isShaderMaterial && !m.material?.transparent) { m.castShadow = true; m.receiveShadow = true; } }), 400);
    return () => clearTimeout(id);
  }, [scene]);
  useEffect(() => {
    stages.current = ["hero", "bunk", "sea"].map((id) => document.getElementById(id));
  }, []);

  useFrame(({ clock }, dt) => {
    let f = 0;
    for (const el of stages.current) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - (el.dataset.sticky ? window.innerHeight : 0));
      f += clamp(-r.top / span, 0, 1);
    }
    fs.current = damp(fs.current, f, 5, dt);
    const s = fs.current;
    const i = Math.min(2, Math.floor(s)), t = smoothstep(s - i, 0, 1);
    const A = POSES[i], B = POSES[i + 1];
    const narrow = size.width < 820;
    const heroMix = 1 - clamp(s, 0, 1);
    const zoom = narrow ? lerp(1.45, 2.15, heroMix) : 1;
    const p = A.p.map((v, k) => lerp(v, B.p[k], t));
    const l = A.l.map((v, k) => lerp(v, B.l[k], t));
    // phones: bed sits low under the headline in hero, centred elsewhere
    const heroW = 1 - clamp(s, 0, 1);
    if (narrow) {
      // park the bed in the lower ~third of the screen (text sits above it); upper third once past the hero
      const dist = Math.hypot(p[0] - l[0], p[1] - l[1], (p[2] * zoom) - l[2]);
      const h = 2 * dist * Math.tan(THREE.MathUtils.degToRad(19));
      l[0] = lerp(l[0], 0, heroW);
      l[1] += 0.3 * h * heroW - 0.3 * (1 - heroW);
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
  });

  return (
    <>
      <group ref={bed}>
        <Bunk curtainOpen={curtain} />
      </group>
      <AC />
      <Room />
    </>
  );
}

export default function Scene() {
  return (
    <div className="scene" aria-hidden="true">
      <Canvas dpr={[1, 1.8]} camera={{ fov: 38, position: [1.4, 1.6, 5.4] }} shadows gl={{ antialias: true, alpha: true }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.35; }}>
        <color attach="background" args={["#f5ebd9"]} />
                <ambientLight intensity={0.95} />
        <hemisphereLight args={["#fff6e8", "#d9c9a8", 0.8]} />
        <directionalLight position={[3, 5, 4]} intensity={2.6} color="#fff1d6" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-3} />
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={2.2} position={[0, 5, 5]} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={1.4} position={[-6, 2, 2]} scale={[4, 6, 1]} color="#cfe6ff" />
          <Lightformer form="rect" intensity={0.9} position={[6, 1.5, 3]} scale={[3, 5, 1]} color="#ffd9a6" />
          <Lightformer form="ring" intensity={1.4} position={[0, 4, -3]} scale={5} color="#ffffff" />
        </Environment>
        <Rig />
        <ContactShadows position={[0, 0.005, 0]} opacity={0.45} scale={8} blur={2.6} far={3} />
        <EffectComposer multisampling={0} enableNormalPass>
          <N8AO aoRadius={0.6} distanceFalloff={1.2} intensity={1.5} quality="medium" />
          <Bloom intensity={0.22} luminanceThreshold={0.92} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.4} darkness={0.12} />
          <SMAA />
        </EffectComposer>
        <Sparkles count={50} scale={[9, 4, 6]} position={[-1, 2, 1]} size={2.2} speed={0.25} color="#ffe2a6" opacity={0.7} />
      </Canvas>
    </div>
  );
}
