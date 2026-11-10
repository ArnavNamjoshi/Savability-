/** Tiny sound effects made with the browser's own synthesizer (no audio files). */

export type Sfx = "chime" | "whoosh" | "clink" | "stamp" | "boing" | "slide" | "fanfare" | "right" | "wrong" | "grow";

let ctx: AudioContext | null = null;
let soundOn = true;

export function setSoundOn(on: boolean) {
  soundOn = on;
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

type ToneOpts = { type?: OscillatorType; gain?: number; slideTo?: number };

function tone(a: AudioContext, freq: number, at: number, dur: number, o: ToneOpts = {}) {
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(freq, t);
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.16, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(a: AudioContext, at: number, dur: number, from: number, to: number, gain = 0.12) {
  const t = a.currentTime + at;
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
  src.stop(t + dur + 0.05);
}

export function play(s: Sfx) {
  if (!soundOn) return;
  const a = audio();
  if (!a) return;
  switch (s) {
    case "chime": // ding-ding, like coins into a piggy bank
      tone(a, 880, 0, 0.35, { type: "triangle" });
      tone(a, 1318.5, 0.13, 0.5, { type: "triangle" });
      break;
    case "whoosh": // soft whoosh then a little click
      noise(a, 0, 0.28, 400, 2400, 0.1);
      tone(a, 1500, 0.26, 0.06, { type: "square", gain: 0.05 });
      break;
    case "clink": // heavy coin dropping into the jar
      tone(a, 2093, 0, 0.18, { type: "sine", gain: 0.12 });
      tone(a, 2637, 0.05, 0.22, { type: "sine", gain: 0.09 });
      tone(a, 600, 0, 0.12, { type: "triangle", gain: 0.08, slideTo: 300 });
      break;
    case "stamp": // thud, then a happy chime
      tone(a, 150, 0, 0.2, { type: "sine", gain: 0.35, slideTo: 50 });
      noise(a, 0, 0.08, 300, 150, 0.15);
      tone(a, 784, 0.22, 0.25, { type: "triangle" });
      tone(a, 1046.5, 0.32, 0.25, { type: "triangle" });
      tone(a, 1568, 0.42, 0.45, { type: "triangle" });
      break;
    case "boing": // funny bounce
      tone(a, 180, 0, 0.12, { type: "sine", gain: 0.2, slideTo: 520 });
      tone(a, 520, 0.12, 0.28, { type: "sine", gain: 0.16, slideTo: 260 });
      break;
    case "slide": // descending slide whistle
      tone(a, 1400, 0, 0.7, { type: "sine", gain: 0.14, slideTo: 260 });
      break;
    case "fanfare": {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => tone(a, n, i * 0.12, 0.3, { type: "triangle", gain: 0.15 }));
      tone(a, 1046.5, 0.5, 0.7, { type: "triangle", gain: 0.15 });
      tone(a, 1318.5, 0.5, 0.7, { type: "triangle", gain: 0.1 });
      [2637, 3136, 3520, 2637].forEach((n, i) => tone(a, n, 0.55 + i * 0.08, 0.18, { gain: 0.05 }));
      break;
    }
    case "right":
      tone(a, 660, 0, 0.12, { type: "triangle" });
      tone(a, 990, 0.08, 0.18, { type: "triangle" });
      break;
    case "wrong":
      tone(a, 300, 0, 0.22, { type: "triangle", gain: 0.12, slideTo: 200 });
      break;
    case "grow":
      [523.25, 659.25, 783.99].forEach((n, i) => tone(a, n, i * 0.09, 0.3, { gain: 0.12 }));
      break;
  }
}
