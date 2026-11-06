// Calm generative background music (Web Audio, no files, no copyright).
// ponytail: browsers block sound until a user gesture, so start() is retried on first tap/key.
let ctx, master, timer, begun = false, muted = false;
const CH = [[130.81, 196, 246.94, 329.63], [110, 164.81, 220, 261.63], [174.61, 220, 261.63, 349.23], [196, 246.94, 293.66, 392]];
const emit = () => typeof window !== "undefined" && window.dispatchEvent(new CustomEvent("gargee-audio", { detail: isPlaying() }));
export const isPlaying = () => begun && !muted && ctx?.state === "running";

function pad(freq, t, dur) {
  [["sine", 0.5, 0], ["triangle", 0.18, 4]].forEach(([type, vol, det]) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq; o.detune.value = det;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 2.2); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.1);
  });
}
function bell(freq, t) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine"; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
  o.connect(g).connect(master); o.start(t); o.stop(t + 2.5);
}
function begin() {
  if (begun) return;
  begun = true;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1500;
  master = ctx.createGain(); master.gain.value = 0;
  const delay = ctx.createDelay(1); delay.delayTime.value = 0.42;
  const fb = ctx.createGain(); fb.gain.value = 0.38;
  master.connect(lp); lp.connect(ctx.destination); lp.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(ctx.destination);
  master.gain.linearRampToValueAtTime(0.13, ctx.currentTime + 3);
  let i = 0;
  const bar = () => {
    const t = ctx.currentTime + 0.05, c = CH[i++ % CH.length];
    c.forEach((f) => pad(f, t, 8));
    [0, 1.5, 3, 4.5].forEach((d) => bell(c[(Math.random() * 4) | 0] * 2, t + d + 0.5));
  };
  bar(); timer = setInterval(bar, 6000);
  emit();
}
export function startMusic() {
  if (typeof window === "undefined") return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    ctx.resume().then(() => { if (ctx.state === "running") begin(); emit(); }).catch(() => {});
  } catch {}
}
export function toggleMusic() {
  if (!begun) return startMusic();
  muted = !muted;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(muted ? 0 : 0.13, ctx.currentTime + 0.8);
  emit();
}
let voice, voiceDone = false;
// Plays the owner's recorded welcome. Returns silently if the browser blocks autoplay; call again on a tap.
export function playWelcome({ onPlay, onEnd } = {}) {
  if (typeof window === "undefined" || voiceDone || (voice && !voice.paused)) return;
  voice ||= new Audio("/audio/welcome-short.mp3");
  voice.onplaying = () => { voiceDone = true; onPlay?.(voice.duration || 9.5); };
  voice.onended = () => onEnd?.();
  voice.play().catch(() => {});
}
export function stopWelcome() { try { voice?.pause(); } catch {} }
