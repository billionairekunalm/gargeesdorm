"use client";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "./three-lite";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Bunk, AC } from "./BunkModel";

/* ---------------- more beds for the "sea view" scene ---------------- */
const BEDS = [[-3.4, 0.95], [-8.6, 0.5], [2.4, 0.0], [4.8, 0.95]]; // [x, curtain tie-back]
export function ExtraBeds({ reveal }) {
  const g = useRef(), warm = useRef(0);
  const wall = useMemo(() => { const t = new THREE.TextureLoader().load("/tex/wall.jpg"); t.colorSpace = THREE.SRGBColorSpace; return t; }, []);
  const opens = useMemo(() => BEDS.map(([, o]) => ({ current: o })), []);
  useFrame(() => {
    const k = reveal.current; if (!g.current) return;
    // first frames: draw once (flat) so geometry/textures/shaders upload now, not in the middle of a scroll
    if (warm.current++ < 3) { g.current.visible = true; g.current.scale.set(1, 0.001, 1); return; }
    g.current.visible = k > 0.01;
    g.current.scale.set(1, Math.max(0.001, k), 1);
  });
  return (
    <group ref={g} visible={false}>
      {BEDS.map(([x], i) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.0, -0.49]}><boxGeometry args={[2.4, 2.0, 0.04]} /><meshStandardMaterial map={wall} roughness={0.7} /></mesh>
          <Bunk curtainOpen={opens[i]} lite />
          <AC lite />
        </group>
      ))}
    </group>
  );
}

/* ---------------- the sea beyond the window ---------------- */
const vert = "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
const frag = `
varying vec2 vUv; uniform float uTime;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.;a*=.5;}return v;}
void main(){
  vec2 uv=vUv; float h=.40; vec3 col;
  if(uv.y>h){
    float t=(uv.y-h)/(1.-h);
    col=mix(vec3(1.,.78,.58),vec3(.98,.62,.55),smoothstep(0.,.25,t));
    col=mix(col,vec3(.28,.54,.93),smoothstep(.18,1.,t));
    float d=distance(vec2(uv.x*1.5,uv.y),vec2(.72*1.5,h+.15));
    col+=vec3(1.,.86,.52)*(smoothstep(.26,.0,d)*.8+smoothstep(.055,.0,d)*2.2);
    float c=fbm(vec2(uv.x*3.+uTime*.025,uv.y*7.)); c=smoothstep(.5,.82,c)*smoothstep(.12,.5,t)*.85;
    col=mix(col,vec3(1.,.94,.9),c);
    float land=h+.008+.018*noise(vec2(uv.x*16.,1.))+.05*smoothstep(.0,.3,.3-uv.x)*noise(vec2(uv.x*5.,3.));
    if(uv.y<land) col=mix(vec3(.30,.42,.52),vec3(.46,.55,.62),(uv.y-h)*20.);
  } else {
    float k=(h-uv.y)/h; float p=1./(k+.07);
    col=mix(vec3(.14,.58,.76),vec3(.02,.24,.46),smoothstep(0.,.6,k));
    float w=sin(uv.x*7.*p*.9+uTime*1.1+fbm(vec2(uv.x*6.,p*.5+uTime*.12))*6.)*.5+.5;
    float w2=sin(p*2.4-uTime*1.5+uv.x*5.)*.5+.5;
    col+=vec3(.07,.11,.13)*w*(.3+k)+vec3(.05)*w2*(.15+k*.5);
    float g=smoothstep(.2,.0,abs(uv.x-.72+(fbm(vec2(p*1.5,uTime*.3))-.5)*.1*p*.3));
    col+=vec3(1.,.82,.5)*g*pow(w,3.)*(1.25-k*.7)*1.3;
    col=mix(col,vec3(.99,.74,.56),smoothstep(.16,0.,k)*.65);
  }
  col=pow(col,vec3(1.8))*.85;
  gl_FragColor=vec4(col,1.);
  #include <colorspace_fragment>
}`;

function Boat({ y, z, speed, offset, scale = 1, color = "#ffffff" }) {
  const g = useRef();
  const sail = useMemo(() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.28, 0); s.lineTo(0.02, 0.6); s.closePath(); return new THREE.ShapeGeometry(s); }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + offset;
    g.current.position.x = -6.2 + ((t % 6) - 3) * 1.0;
    g.current.position.y = y + Math.sin(clock.elapsedTime * 1.3 + offset) * 0.012;
    g.current.rotation.z = Math.sin(clock.elapsedTime * 1.1 + offset) * 0.03;
  });
  return (
    <group ref={g} position={[-6.2, y, z]} scale={scale}>
      <mesh geometry={sail} position={[-0.02, 0.05, 0]}><meshBasicMaterial color={color} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0.0, 0.025, 0]}><boxGeometry args={[0.36, 0.05, 0.04]} /><meshBasicMaterial color="#3a2a22" /></mesh>
    </group>
  );
}

function Birds() {
  const g = useRef();
  const wings = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ x: i * 0.6, y: 2.0 + (i % 3) * 0.25, s: 0.7 + (i % 3) * 0.15 })), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    g.current.children.forEach((b, i) => {
      const w = wings[i];
      b.position.x = -8.4 + ((t * 0.35 + w.x) % 4.4);
      b.position.y = w.y + Math.sin(t * 0.8 + i) * 0.06;
      b.children[0].rotation.z = 0.5 * Math.sin(t * 9 + i);
      b.children[1].rotation.z = -0.5 * Math.sin(t * 9 + i);
    });
  });
  return (
    <group ref={g} position={[0, 0, -1.95]}>
      {wings.map((w, i) => (
        <group key={i} scale={w.s}>
          <mesh position={[-0.05, 0, 0]}><planeGeometry args={[0.1, 0.012]} /><meshBasicMaterial color="#2b3350" side={THREE.DoubleSide} /></mesh>
          <mesh position={[0.05, 0, 0]}><planeGeometry args={[0.1, 0.012]} /><meshBasicMaterial color="#2b3350" side={THREE.DoubleSide} /></mesh>
        </group>
      ))}
    </group>
  );
}

function Sheer({ x }) {
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(0.42, 1.9, 10, 24); g.userData.b = g.attributes.position.array.slice(); return g; }, []);
  useFrame(({ clock }) => {
    const p = geo.attributes.position, b = geo.userData.b, t = clock.elapsedTime;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(b[i * 3] * 14 + t * 0.9 + b[i * 3 + 1]) * 0.03 + Math.sin(b[i * 3] * 5 + t * 0.5) * 0.02 * (0.9 - b[i * 3 + 1]));
    p.needsUpdate = true; geo.computeVertexNormals();
  });
  return <mesh geometry={geo} position={[x, 1.45, -0.36]}><meshStandardMaterial color="#fffaf0" transparent opacity={0.38} side={THREE.DoubleSide} roughness={1} depthWrite={false} /></mesh>;
}

export function SeaWindow({ x = -6.2, y = 1.45 }) {
  const mat = useRef();
  useFrame(({ clock }) => { mat.current.uniforms.uTime.value = clock.elapsedTime; });
  return (
    <group>
      <mesh position={[x, y + 0.6, -2.2]}>
        <planeGeometry args={[8.5, 5.2]} />
        <shaderMaterial ref={mat} uniforms={{ uTime: { value: 0 } }} vertexShader={vert} fragmentShader={frag} />
      </mesh>
      {/* sailboats + birds, drawn in front of the sea backdrop */}
      <Boat y={1.28} z={-2.15} speed={0.09} offset={0.5} scale={1.2} />
      <Boat y={1.42} z={-2.15} speed={0.06} offset={3.1} scale={0.7} color="#ffe6c8" />
      <Boat y={1.1} z={-2.15} speed={0.075} offset={5.2} scale={0.9} color="#e9f3ff" />
      <Birds />
      {/* glass + balcony railing outside */}
      <mesh position={[x, y, -0.55]}><planeGeometry args={[2.2, 1.5]} /><meshStandardMaterial color="#cfe9ff" transparent opacity={0.025} roughness={0.05} metalness={0.2} depthWrite={false} /></mesh>
      <mesh position={[x, y - 0.5, -0.95]}><boxGeometry args={[2.6, 0.045, 0.045]} /><meshStandardMaterial color="#f4f5f7" metalness={0.3} roughness={0.35} /></mesh>
      {Array.from({ length: 13 }, (_, i) => <mesh key={i} position={[x - 1.2 + i * 0.2, y - 0.77, -0.95]}><boxGeometry args={[0.018, 0.5, 0.018]} /><meshStandardMaterial color="#f4f5f7" metalness={0.3} roughness={0.35} /></mesh>)}
      {/* sheer curtains + window sill plant */}
      <Sheer x={x - 1.28} /><Sheer x={x + 1.28} />
      <group position={[x + 0.7, 0.78, -0.35]}>
        <mesh position={[0, 0.07, 0]}><cylinderGeometry args={[0.07, 0.055, 0.14, 16]} /><meshStandardMaterial color="#fff" roughness={0.5} /></mesh>
        {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[Math.sin(i * 1.3) * 0.04, 0.22, Math.cos(i * 1.3) * 0.04]} rotation={[Math.cos(i * 1.3) * 0.5, 0, -Math.sin(i * 1.3) * 0.5]} scale={[0.55, 1.5, 0.55]}><sphereGeometry args={[0.07, 10, 10]} /><meshStandardMaterial color="#3f8f46" roughness={0.8} /></mesh>)}
      </group>
      {/* soft sunbeams falling into the room */}
      {[-0.6, 0, 0.6].map((dx, i) => (
        <mesh key={i} position={[x + dx + 0.5, 0.9, 0.5]} rotation={[-0.9, 0, 0.12 * (i - 1)]}>
          <planeGeometry args={[0.5, 3]} />
          <meshBasicMaterial color="#ffe2a8" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
