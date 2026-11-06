"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent, useMotionValue, useSpring, useTransform } from "framer-motion";
import Tower from "./TowerLoader";
import { SITE, WA, CALL, CALL2, MAP_LINK, MAP_EMBED, FAQ } from "@/lib/data";

const rise = { hidden: { opacity: 0, y: 44 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }) };
const Rise = ({ i = 0, className, children, as: T = "div" }) => {
  const M = motion[T];
  return <M className={className} variants={rise} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>{children}</M>;
};

const WaIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>
);

function Tilt({ children, className }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [9, -9]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 200, damping: 18 });
  return (
    <motion.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onMouseMove={(e) => { const b = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - b.left) / b.width - 0.5); y.set((e.clientY - b.top) / b.height - 0.5); }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >{children}</motion.div>
  );
}

function Header() {
  return (
    <header className="hdr">
      <a href="#hero" className="brand" aria-label="Gargee's Dormitory home">
        <Image src="/img/logo.png" alt="Gargee's logo" width={108} height={58} priority />
      </a>
      <nav aria-label="Primary">
        <a href="#stay">Stay</a><a href="#bunk">Your bunk</a><a href="#gallery">Gallery</a><a href="#sea">Sea view</a><a href="#location">Location</a><a href="#faq">FAQ</a>
      </nav>
      <div className="hdr-cta">
        <a className="btn btn-ghost sm" href={CALL}><PhoneIcon /><span>Call</span></a>
        <a className="btn btn-wa sm" href={WA} target="_blank" rel="noopener"><WaIcon /><span>WhatsApp</span></a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-in">
        <motion.p className="pill" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}><i className="dot" /> Open 24×7 · CBD Belapur, Navi Mumbai</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
          Navi Mumbai&apos;s <span className="hl">best</span> dormitory.
        </motion.h1>
        <motion.a href={WA} target="_blank" rel="noopener" className="price-ad" aria-label="Just 300 rupees per night - book on WhatsApp" initial={{ opacity: 0, scale: 0.6, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: -2 }} transition={{ delay: 0.6, type: "spring", stiffness: 160, damping: 11 }}>
          <span className="pa-top">★ Comfortable &amp; Clean ★</span>
          <span className="pa-main"><small>JUST</small><b>₹300</b><small>PER<br />NIGHT</small></span>
          <span className="pa-perf" /><span className="pa-bot">Book your bed now <i>→</i></span><em className="sp s1">✦</em><em className="sp s2">✦</em><em className="sp s3">✦</em>
        </motion.a>
        <motion.p className="lead" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.9 }}>
          <b>Comfortable. Clean. Sea view facing.</b> AC &amp; Non-AC dormitory beds with private curtain, your own socket and light, in CBD Belapur — open 24×7.
        </motion.p>
        <motion.ul className="ticks" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.8 }}>
          <li>AC &amp; Non-AC dormitory beds</li><li>Private curtain, own socket &amp; light</li><li>Sea view facing · CBD Belapur · Open 24×7</li>
        </motion.ul>
        <motion.div className="cta-row" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.9 }}>
          <a className="btn btn-wa" href={WA} target="_blank" rel="noopener"><WaIcon /> Book on WhatsApp</a>
          <a className="btn btn-dark" href={CALL}><PhoneIcon /> Call <span className="nm">{SITE.phone1}</span></a>
        </motion.div>
        <motion.ul className="chips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <li>💰 ₹300 / night</li><li>❄ AC &amp; Non-AC</li><li>🌊 Sea view facing</li>
        </motion.ul>
      </div>
      <div className="scroll-cue" aria-hidden="true"><span /> scroll</div>
    </section>
  );
}

const Ico = {
  snow: <path d="M12 2v20M4.9 6l14.2 12M19.1 6 4.9 18M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5" />,
  bed: <path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7.5 11.5a1.5 1.5 0 1 0 0-.01" />,
  plug: <path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5" />,
  clock: <path d="M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />,
};
const FEATURES = [
  ["snow", "AC & Non-AC dorms", "Pick the cool of an air-conditioned dorm or the easy breeze of a Non-AC one."],
  ["bed", "Private curtain bunks", "Draw the curtain and your bunk becomes your own quiet corner."],
  ["plug", "Socket & light per bed", "Charge your phone and read late without disturbing anyone."],
  ["clock", "24×7 service", "Late train? Early flight? We are a call or WhatsApp away, day or night."],
];

function Stay() {
  return (
    <section id="stay" className="sec light">
      <div className="wrap">
        <Rise className="head"><span className="kick">Why Gargee&apos;s</span><h2>Everything you need for a <em>good night&apos;s rest</em></h2></Rise>
        <div className="grid4">
          {FEATURES.map(([ic, t, d], i) => (
            <Rise key={t} i={i}>
              <Tilt className="card">
                <span className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{Ico[ic]}</svg></span>
                <h3>{t}</h3><p>{d}</p>
              </Tilt>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const t = ["AC Dormitory", "Non-AC Dormitory", "Sea View Facing", "24×7 Service", "CBD Belapur", "Navi Mumbai"];
  return (
    <div className="marquee" aria-hidden="true"><div className="track">{[...t, ...t, ...t, ...t].map((s, i) => <span key={i}>{s}<b>✦</b></span>)}</div></div>
  );
}

function Stats() {
  const s = [["24×7", "service, every day"], ["AC + Non-AC", "dormitories"], ["Sea view", "facing"], ["2", "helpline numbers"]];
  return (
    <section className="stats"><div className="wrap stats-in">
      {s.map(([a, b], i) => <Rise key={a} i={i} className="stat"><strong>{a}</strong><span>{b}</span></Rise>)}
    </div></section>
  );
}

const STEPS = [
  ["Your own bunk", "Draw the curtain and the world goes quiet. Every bed is a private nook with its own light.", "01"],
  ["Switch on. Switch off.", "A personal power socket and reading light at every bed, plus an AC remote in the AC dorm.", "02"],
  ["Fresh linen, warm blanket", "Crisp striped white linen, a soft pillow and a folded blanket — ready when you are.", "03"],
];

function Bunk() {
  const ref = useRef(null);
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.min(2, Math.floor(v * 3))));
  return (
    <section id="bunk" ref={ref} data-sticky="1" className="stage bunk">
      <div className="stick">
        <div className="glass step-card">
          <span className="kick">Inside your bunk</span>
          <div className="steps">{STEPS.map(([t, d, n], i) => (
            <motion.div key={n} className="step" animate={{ opacity: step === i ? 1 : 0, y: step === i ? 0 : 24 }} transition={{ duration: 0.5 }} style={{ position: "absolute", inset: "0 0 auto 0", pointerEvents: step === i ? "auto" : "none" }} aria-hidden={step !== i}>
              <b className="num">{n}</b><h2>{t}</h2><p>{d}</p>
            </motion.div>
          ))}</div>
          <div className="dots">{STEPS.map((_, i) => <i key={i} className={i === step ? "on" : ""} />)}</div>
        </div>
      </div>
    </section>
  );
}

const PHOTOS = [
  ["/img/bunk.jpg", "AC bunk beds with privacy curtain and wall-mounted air conditioner", "AC bunks", 960, 1280],
  ["/img/bed-1.jpg", "Single bunk with white linen, blanket and AC remote, power socket on wall", "Linen, blanket & remote", 1280, 960],
  ["/img/bed-2.jpg", "Bed with pillow, folded blanket and cream curtain", "Pillow & curtain", 960, 1280],
];
function Gallery() {
  return (
    <section id="gallery" className="sec light">
      <div className="wrap">
        <Rise className="head"><span className="kick">See it for yourself</span><h2>Real beds. <em>Real rooms.</em></h2></Rise>
        <div className="gal">
          {PHOTOS.map(([src, alt, cap, w, h], i) => (
            <Rise key={src} i={i} className={`g g${i}`}>
              <Tilt className="photo"><Image src={src} alt={alt} width={w} height={h} sizes="(max-width: 800px) 100vw, 33vw" /><span>{cap}</span></Tilt>
            </Rise>
          ))}
          <Rise i={3} className="g g3">
            <Tilt className="photo vid">
              <video src="/video/tour.mp4" poster="/img/tour-poster.jpg" autoPlay muted loop playsInline preload="metadata" aria-label="Short video tour of the dormitory" />
              <span>Quick walk-through</span>
            </Tilt>
          </Rise>
        </div>
      </div>
    </section>
  );
}

function Sea() {
  return (
    <section id="sea" data-sticky="1" className="stage sea">
      <div className="stick right">
        <Rise className="glass sea-card">
          <span className="kick">Sea view facing</span>
          <h2>Wake up to <em>open water.</em></h2>
          <p>Gargee&apos;s faces the sea from the 4th floor of Bay View Tower. Ask us about sea-facing beds when you book.</p>
          <a className="btn btn-wa" href={WA} target="_blank" rel="noopener"><WaIcon /> Ask about sea-facing beds</a>
        </Rise>
      </div>
    </section>
  );
}

function Floor() {
  return (
    <section id="floor" className="sec light">
      <div className="wrap loc">
        <Rise className="loc-info">
          <span className="kick">How to find us</span>
          <h2>We&apos;re on the <em>4th floor</em></h2>
          <p className="floor-p">Look for <b>Bay View Tower</b> on Plot No. 7, Sector-11, CBD Belapur, opposite Dominoz Pizza. Take the lift to the <b>4th floor</b>, flat <b>#401</b> — that&apos;s Gargee&apos;s.</p>
          <div className="cta-row"><a className="btn btn-wa" href={WA} target="_blank" rel="noopener"><WaIcon /> Ask for directions</a></div>
        </Rise>
        <Rise i={1}><Tower /></Rise>
      </div>
      <div className="wrap real">
        <Rise className="real-head"><span className="kick">The real building</span><h3>This is Bay View Tower — <em>spot it from the road</em></h3></Rise>
        <div className="real-grid one">
          <Rise i={0}><figure className="photo real-ph"><Image src="/img/building-gargees.webp" alt="Bay View Tower, Sector-11, CBD Belapur, Navi Mumbai - Gargee's Dormitory is on the 4th floor" width={1536} height={1024} sizes="(max-width: 1200px) 100vw, 1160px" /><figcaption>Gargee&apos;s Dormitory · 4th Floor, Bay View Tower</figcaption></figure></Rise>
        </div>
      </div>
    </section>
  );
}

function Location() {
  const a = SITE.address;
  return (
    <section id="location" className="sec light">
      <div className="wrap loc">
        <Rise className="loc-info">
          <span className="kick">Find us</span>
          <h2>Right in <em>CBD Belapur</em></h2>
          <address>{a.street}<br />{a.locality} – {a.postalCode}</address>
          <ul className="contact">
            <li><PhoneIcon /> <a href={CALL}>{SITE.phone1}</a> / <a href={CALL2}>{SITE.phone2}</a></li>
            <li>✉ <a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            <li>👤 {SITE.owner} (Prop.)</li>
          </ul>
          <div className="cta-row">
            <a className="btn btn-dark" href={MAP_LINK} target="_blank" rel="noopener">Get directions</a>
            <a className="btn btn-wa" href={WA} target="_blank" rel="noopener"><WaIcon /> WhatsApp</a>
          </div>
        </Rise>
        <Rise i={1} className="map"><iframe title="Map to Gargee's Dormitory, CBD Belapur" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></Rise>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="sec light">
      <div className="wrap narrow">
        <Rise className="head"><span className="kick">Questions</span><h2>Good to <em>know</em></h2></Rise>
        {FAQ.map(([q, a], i) => (
          <Rise key={q} i={i * 0.3}><details className="qa"><summary>{q}<i /></summary><p>{a}</p></details></Rise>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <Rise className="final">
          <Image src="/img/logo.png" alt="Gargee's" width={150} height={80} />
          <h2>Your bunk is waiting.</h2>
          <p>Message us now — we&apos;ll confirm availability and rates.</p>
          <div className="cta-row c">
            <a className="btn btn-wa lg" href={WA} target="_blank" rel="noopener"><WaIcon /> WhatsApp {SITE.phone1}</a>
            <a className="btn btn-light lg" href={CALL}><PhoneIcon /> Call now</a>
          </div>
        </Rise>
        <div className="foot-bar">
          <span>© {new Date().getFullYear()} Gargee&apos;s Dormitory · {SITE.address.locality}</span>
          <span>{SITE.phone1} / {SITE.phone2} · {SITE.email}</span>
        </div>
      </div>
    </footer>
  );
}

function Float() {
  return (
    <div className="float">
      <a className="fab call" href={CALL} aria-label="Call Gargee's Dormitory"><PhoneIcon /></a>
      <a className="fab wa" href={WA} target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><WaIcon /><em>Chat on WhatsApp</em></a>
    </div>
  );
}

export default function Site() {
  return (
    <main>
      <Header />
      <Hero />
      <Stay />
      <Marquee />
      <Stats />
      <Bunk />
      <Gallery />
      <Sea />
      <Floor />
      <Location />
      <Faq />
      <Footer />
      <Float />
    </main>
  );
}
