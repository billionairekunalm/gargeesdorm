"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import { REVIEWS } from "@/lib/reviews";
import "./reviews.css";

const EASE = [0.22, 1, 0.36, 1];
const INTERVAL = 6500;

function Stars({ n = 5, glow }) {
  return (
    <div className="rv-stars" aria-label={`${n} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.svg key={i} viewBox="0 0 24 24" width="18" height="18" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.09, duration: 0.6, ease: EASE }}>
          <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z" fill={glow || i < n ? "#e9c46a" : "none"} stroke="#e9c46a" strokeWidth="1.2" />
        </motion.svg>
      ))}
    </div>
  );
}

function Words({ text }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <motion.span key={i} className="rv-w" initial={{ opacity: 0, y: 14, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.15 + i * 0.03, duration: 0.7, ease: EASE }}>{w}&nbsp;</motion.span>
      ))}
    </>
  );
}

export default function Reviews() {
  const list = REVIEWS;
  const N = list.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const qy = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const go = (n) => { setDir(n > 0 ? 1 : -1); setI((v) => (v + n + N) % N); };

  useEffect(() => {
    if (!seen || paused || N < 2) return;
    const t = setTimeout(() => go(1), INTERVAL);
    return () => clearTimeout(t);
  }, [seen, paused, i, N]);

  const r = list[i];
  if (!N) return null;
  return (
    <section id="reviews" ref={ref} className="rv">
      <div className="rv-aurora" aria-hidden="true" />
      <motion.b className="rv-q" style={{ y: qy }} aria-hidden="true">“</motion.b>
      <div className="wrap rv-in">
        <motion.span className="kick" initial={{ opacity: 0, y: 16 }} animate={seen ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: EASE }}>Guest reviews</motion.span>
        <motion.h2 initial={{ opacity: 0, y: 28, filter: "blur(10px)" }} animate={seen ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}} transition={{ duration: 1, ease: EASE, delay: 0.1 }}>
          In our guests&apos; <em>own words</em>
        </motion.h2>
        <motion.i className="rv-line" initial={{ scaleX: 0 }} animate={seen ? { scaleX: 1 } : {}} transition={{ duration: 1.4, ease: EASE, delay: 0.3 }} />

        {N > 0 && (
          <div className="rv-stage" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.figure
                key={i}
                className="rv-card"
                custom={dir}
                initial={{ opacity: 0, x: 40 * dir }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 * dir, filter: "blur(6px)" }}
                transition={{ duration: 0.7, ease: EASE }}
                drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2}
                onDragEnd={(e, info) => { if (info.offset.x < -60) go(1); else if (info.offset.x > 60) go(-1); }}
              >
                {r.rating ? <Stars n={r.rating} /> : null}
                <blockquote className="rv-text"><Words text={r.text} /></blockquote>
                <figcaption>
                  <motion.span className="rv-av" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6, ease: EASE }}>{r.name.trim()[0]}</motion.span>
                  <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.6, ease: EASE }}><b>{r.name}</b><small>Guest at Gargee&apos;s</small></motion.span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>

            {N > 1 && (
              <div className="rv-ctl">
                <button onClick={() => go(-1)} aria-label="Previous review">←</button>
                <div className="rv-bars">
                  {list.map((x, k) => (
                    <span key={x.name} className={k === i ? "on" : ""} onClick={() => { setDir(k > i ? 1 : -1); setI(k); }}>
                      {k === i && <motion.i key={`${i}-${paused}`} initial={{ scaleX: 0 }} animate={{ scaleX: paused ? 0 : 1 }} transition={{ duration: paused ? 0 : INTERVAL / 1000, ease: "linear" }} />}
                    </span>
                  ))}
                </div>
                <button onClick={() => go(1)} aria-label="Next review">→</button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
