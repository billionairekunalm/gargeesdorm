"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { startMusic, toggleMusic, playWelcome, playRest, restDone, stopWelcome, isPlaying } from "@/lib/audio";
import "./intro.css";

const CAPTION = "Namaste! 🙏 Welcome to Gargee's Dormitory";
const NO_VOICE_OPEN = 3200; // doors open anyway if the browser blocks the voice
const HOLD = 500; // open doors (with the website behind) stay visible this long before the scene fades

function Receptionist() {
  return (
    <svg className="rec" viewBox="0 0 400 470" role="img" aria-label="Receptionist greeting with Namaste">
      <g className="bow">
        <path d="M70 470 L96 330 Q200 285 304 330 L330 470 Z" fill="#8a1c3a" />
        <path d="M150 318 L200 400 L168 470 L96 470 L100 336Z M250 318 L200 400 L232 470 L304 470 L300 336Z" fill="#a52a4b" />
        <path d="M172 322 L200 390 L228 322 Z" fill="#fff" />
        <rect x="262" y="372" width="46" height="20" rx="3" fill="#fbf1e0" stroke="#d9a441" strokeWidth="2" /><rect x="268" y="379" width="18" height="6" rx="2" fill="#ed2024" />
        <rect x="186" y="276" width="28" height="54" rx="10" fill="#e3a77c" />
        <g className="head">
          <path d="M144 214 Q144 134 200 134 Q256 134 256 214 Q246 160 200 160 Q154 160 144 214Z" fill="#3a2016" />
          <circle cx="200" cy="120" r="30" fill="#3a2016" />
          <ellipse cx="200" cy="226" rx="52" ry="60" fill="#f2bb91" />
          <path d="M146 222 Q150 156 200 156 Q250 156 254 222 Q240 178 200 178 Q160 178 146 222Z" fill="#3a2016" />
          <path d="M166 232 Q178 242 190 232M210 232 Q222 242 234 232" stroke="#3a2016" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M164 228 l-5 -4M236 228 l5 -4" stroke="#3a2016" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="200" cy="200" r="3.8" fill="#ed2024" />
          <circle cx="160" cy="250" r="10" fill="#ff9d8a" opacity=".5" /><circle cx="240" cy="250" r="10" fill="#ff9d8a" opacity=".5" />
          <path className="smile" d="M180 258 Q200 276 220 258" stroke="#b5352f" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="148" cy="240" r="4" fill="#d9a441" /><circle cx="252" cy="240" r="4" fill="#d9a441" />
        </g>
        <path d="M116 350 Q128 420 188 424" stroke="#8a1c3a" strokeWidth="42" strokeLinecap="round" fill="none" />
        <path d="M284 350 Q272 420 212 424" stroke="#8a1c3a" strokeWidth="42" strokeLinecap="round" fill="none" />
        <g className="hands"><ellipse cx="200" cy="410" rx="21" ry="34" fill="#f2bb91" /><path d="M200 380 V440" stroke="#c98a62" strokeWidth="2.5" /></g>
      </g>
    </svg>
  );
}

function Plant({ className, pot }) {
  const leaves = [-62, -38, -14, 12, 36, 60];
  return (
    <svg className={`plant ${className}`} viewBox="-90 -150 180 230" aria-hidden="true">
      <defs><linearGradient id="lf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5fae4b" /><stop offset="1" stopColor="#1f6b34" /></linearGradient></defs>
      {leaves.map((a, i) => <ellipse key={a} cx="0" cy="-62" rx={i % 2 ? 22 : 26} ry={i % 2 ? 62 : 54} transform={`rotate(${a})`} fill="url(#lf)" stroke="#17532a" strokeWidth="1.5" />)}
      {pot && <path d="M-32 0 H32 L24 70 H-24 Z" fill="#fff" stroke="#e6dccb" strokeWidth="2" />}
    </svg>
  );
}

export default function Intro() {
  const [phase, setPhase] = useState("greet"); // greet (she speaks) -> open (doors swing) -> leave -> done
  const [n, setN] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const R = useRef({ opened: false, timers: [] });

  useEffect(() => {
    const r = R.current;
    document.documentElement.style.overflow = "hidden";
    const later = (fn, ms) => { const t = setTimeout(fn, ms); r.timers.push(t); return t; };
    const leave = () => {
      setPhase("leave"); document.documentElement.style.overflow = "";
      later(() => setPhase("done"), 1000);
    };
    const open = () => {
      if (r.opened) return; r.opened = true;
      clearTimeout(r.fallback);
      setPhase("open");
      later(leave, 1300 + HOLD);
      later(() => playRest(), 700); // the rest of the welcome is spoken over the website
    };
    const voice = () => playWelcome({
      onPlay: () => { setVoiceOn(true); clearTimeout(r.fallback); },
      onEnd: () => later(open, 350),
    });
    const gest = () => { startMusic(); if (!r.opened) voice(); else if (!restDone()) playRest(); };
    startMusic();
    voice();
    r.timers.push(setInterval(() => setN((v) => Math.min(CAPTION.length, v + 1)), 70));
    r.fallback = later(open, NO_VOICE_OPEN); // cleared if the voice really starts
    const evs = ["pointerdown", "keydown", "touchstart"];
    evs.forEach((e) => window.addEventListener(e, gest, { once: true }));
    const on = (e) => setPlaying(e.detail);
    window.addEventListener("gargee-audio", on);
    setPlaying(isPlaying());
    return () => { r.timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); clearTimeout(r.fallback); window.removeEventListener("gargee-audio", on); evs.forEach((e) => window.removeEventListener(e, gest)); };
  }, []);

  const skip = () => {
    stopWelcome();
    R.current.timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
    clearTimeout(R.current.fallback);
    document.documentElement.style.overflow = "";
    setPhase("done");
  };

  return (
    <>
      {phase !== "done" && (
        <div className={`intro ${phase}`} role="dialog" aria-label="Welcome to Gargee's Dormitory">
          <div className="wall">
            <div className="arch" />
            <div className="dust">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.7) % 5}s`, animationDuration: `${6 + (i % 4)}s` }} />)}</div>
          </div>
          <div className="istage">
            <div className="zoom">
              <header className="brand-top">
                <Image src="/img/logo.png" alt="Gargee's logo" width={300} height={162} priority />
                <h1>Gargee&apos;s<br /><span>Dormitory</span></h1>
                <p><i />Comfortable • Clean • ₹300<i /></p>
              </header>

              <div className="doorway">
                <div className="leaf dl"><b className="pan" /><b className="pan p2" /><span className="handle" /></div>
                <div className="leaf dr"><b className="pan" /><b className="pan p2" /><span className="handle" /></div>
                <div className="rays" />
              </div>

              <Plant className="pl1" pot />
              <Plant className="pl2" />
              <Plant className="pl3" />
              <div className="who"><Receptionist /></div>
              <div className="desk">
                <div className="ledge" /><span className="bell" />
                <div className="plaque"><small>Welcome to</small><b>Gargee&apos;s Dormitory</b><em>⌂</em><span className="shine" /></div>
              </div>
              <div className={`caption${phase === "greet" ? " on" : ""}`} aria-live="polite">{CAPTION.slice(0, n)}</div>
              {phase === "greet" && !voiceOn && n > 6 && <p className="tap">🔊 Tap anywhere to hear her</p>}
            </div>
          </div>
          <button className="skip" onClick={skip}>Skip ▸</button>
        </div>
      )}
      <button className={`snd${playing ? " on" : ""}`} onClick={() => toggleMusic()} aria-label={playing ? "Mute music" : "Play calm music"}>
        {playing ? "🔊" : "🔇"}<span>{playing ? "Music on" : "Tap for music"}</span>
      </button>
    </>
  );
}
