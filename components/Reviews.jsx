"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { REVIEWS } from "@/lib/reviews";
import "./reviews.css";

const HUES = [["#ffb347", "#ed2024"], ["#7ee8fa", "#1f6feb"], ["#b6f09c", "#12a150"], ["#ffd1ff", "#a64dff"], ["#ffe28a", "#ff7b00"]];
const dev = process.env.NODE_ENV !== "production";

function Stars({ n, on }) {
  return (
    <div className="stars" aria-label={`${n} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.svg key={i} viewBox="0 0 24 24" width="20" height="20" animate={on ? { scale: [0, 1.35, 1], rotate: [-40, 0], opacity: 1 } : { scale: 0.7, opacity: 0.35 }} transition={{ delay: on ? 0.35 + i * 0.1 : 0, duration: 0.5 }}>
          <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z" fill={i < n ? "#ffc83d" : "#d9d9e3"} />
        </motion.svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  const list = dev ? REVIEWS : REVIEWS.filter((r) => !r.sample);
  const N = list.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const box = useRef(null);
  const seen = useInView(box, { once: true, margin: "-120px" });
  useEffect(() => {
    if (!seen || paused || N < 2) return;
    const t = setInterval(() => setIdx((v) => v + 1), 4200);
    return () => clearInterval(t);
  }, [seen, paused, N]);
  if (!N) return null;
  const step = 360 / N, active = ((idx % N) + N) % N;

  return (
    <section id="reviews" className="rev">
      <div className="rev-bg" aria-hidden="true">
        <b className="q">“</b>
        {Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i * 0.9) % 7}s`, animationDuration: `${8 + (i % 5)}s` }} />)}
      </div>
      <div className="wrap">
        <motion.div className="head rev-head" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span className="kick">Guest love</span>
          <h2>What our guests <em>say</em></h2>
        </motion.div>

        <div ref={box} className="ring-wrap" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setTimeout(() => setPaused(false), 6000)}>
          <div className="rpos"><motion.div
            className="ring"
            initial={{ rotateY: 200, scale: 0.55, opacity: 0 }}
            animate={seen ? { rotateY: -idx * step, scale: 1, opacity: 1 } : {}}
            transition={{ rotateY: { type: "spring", stiffness: 45, damping: 15 }, scale: { duration: 1.1 }, opacity: { duration: 0.8 } }}
            onPanEnd={(e, info) => { if (info.offset.x < -40) setIdx((v) => v + 1); else if (info.offset.x > 40) setIdx((v) => v - 1); }}
            style={{ "--n": N }}
          >
            {list.map((r, i) => {
              const [c1, c2] = HUES[i % HUES.length], on = i === active;
              return (
                <article key={r.name} className={`rcard${on ? " on" : ""}`} style={{ "--a": `${i * step}deg` }} aria-hidden={!on}>
                  <span className="qmark">”</span>
                  <Stars n={r.rating || 5} on={on} />
                  <p className="rtext">{r.text}</p>
                  <footer>
                    <span className="av" style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>{r.name.trim()[0]}</span>
                    <span><b>{r.name}</b><small>Guest at Gargee&apos;s</small></span>
                  </footer>
                  {r.sample && <i className="samp">Sample · localhost only</i>}
                </article>
              );
            })}
          </motion.div></div>
        </div>

        <div className="rev-ctl">
          <button onClick={() => setIdx((v) => v - 1)} aria-label="Previous review">←</button>
          <div className="rdots">{list.map((r, i) => <i key={r.name} className={i === active ? "on" : ""} onClick={() => setIdx(idx + (((i - active) % N) + N) % N)} />)}</div>
          <button onClick={() => setIdx((v) => v + 1)} aria-label="Next review">→</button>
        </div>
        {list.some((r) => r.sample) && <p className="rev-note">Preview only — sample text. Add each guest&apos;s real words in <code>lib/reviews.js</code> to publish.</p>}
      </div>
    </section>
  );
}
