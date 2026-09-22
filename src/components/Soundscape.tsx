import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Flame, CloudRain, Wind } from "lucide-react";

type SceneKey = "fire" | "rain" | "air";

const SCENES: { key: SceneKey; label: string; blurb: string; icon: typeof Flame }[] = [
  { key: "fire", label: "Firelight", blurb: "Crackle, hiss, and warmth", icon: Flame },
  { key: "rain", label: "Rainfall", blurb: "Soft rain on a far roof", icon: CloudRain },
  { key: "air", label: "Night air", blurb: "Wind and a low silver pad", icon: Wind },
];

/**
 * A tiny generative soundscape. Every sound is synthesized live with the
 * Web Audio API — no audio files, no network, no keys.
 */
export default function Soundscape() {
  const [playing, setPlaying] = useState(false);
  const [scene, setScene] = useState<SceneKey>("fire");
  const [volume, setVolume] = useState(0.6);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const noiseBufRef = useRef<AudioBuffer | null>(null);
  const activeRef = useRef<AudioScheduledSourceNode[]>([]);
  const timersRef = useRef<number[]>([]);

  const ensureCtx = () => {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;

      // Shared 2s noise buffer
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02; // soften toward pink-ish
        data[i] = last * 3.2;
      }
      noiseBufRef.current = buf;
    }
    void ctxRef.current.resume();
  };

  const stopActive = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    activeRef.current.forEach((n) => {
      try {
        n.stop();
      } catch {
        /* already stopped */
      }
    });
    activeRef.current = [];
  };

  const playScene = (key: SceneKey) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    const noise = noiseBufRef.current;
    if (!ctx || !master || !noise) return;
    stopActive();

    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    activeRef.current.push(src);

    if (key === "fire") {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 420;
      bp.Q.value = 0.6;
      const g = ctx.createGain();
      g.gain.value = 0.5;
      src.connect(bp).connect(g).connect(master);

      // Random crackles
      const crackle = () => {
        const c = ctx.createBufferSource();
        c.buffer = noise;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 1400 + Math.random() * 1200;
        const cg = ctx.createGain();
        const t0 = ctx.currentTime;
        cg.gain.setValueAtTime(0.0001, t0);
        cg.gain.exponentialRampToValueAtTime(0.12 + Math.random() * 0.1, t0 + 0.012);
        cg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05 + Math.random() * 0.08);
        c.connect(hp).connect(cg).connect(master);
        c.start(t0, Math.random() * 1.5, 0.2);
        timersRef.current.push(window.setTimeout(crackle, 90 + Math.random() * 380));
      };
      crackle();
    } else if (key === "rain") {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 950;
      const g = ctx.createGain();
      g.gain.value = 0.42;
      src.connect(lp).connect(g).connect(master);

      // Slow swell of intensity
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.1;
      lfo.connect(lfoGain).connect(g.gain);
      lfo.start();
      activeRef.current.push(lfo);

      // Distant hiss for droplets
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 4200;
      const hg = ctx.createGain();
      hg.gain.value = 0.05;
      src.connect(hp).connect(hg).connect(master);
    } else {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 300;
      const g = ctx.createGain();
      g.gain.value = 0.4;
      src.connect(lp).connect(g).connect(master);

      // Wind swell
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.045;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.14;
      lfo.connect(lfoGain).connect(g.gain);
      lfo.start();
      activeRef.current.push(lfo);

      // Low silver pad (a fifth apart)
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.value = 640;
      const padGain = ctx.createGain();
      padGain.gain.value = 0.05;
      [110, 165.2].forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;
        osc.detune.value = i === 0 ? -3 : 4;
        const og = ctx.createGain();
        og.gain.value = 0.5;
        osc.connect(og).connect(padFilter);
        osc.start();
        activeRef.current.push(osc);
      });
      padFilter.connect(padGain).connect(master);
    }

    src.start();
  };

  const toggle = () => {
    ensureCtx();
    if (playing) {
      stopActive();
      setPlaying(false);
    } else {
      playScene(scene);
      setPlaying(true);
    }
  };

  const chooseScene = (key: SceneKey) => {
    setScene(key);
    if (playing) {
      ensureCtx();
      playScene(key);
    }
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(v, ctxRef.current.currentTime, 0.05);
    }
  };

  useEffect(
    () => () => {
      stopActive();
      void ctxRef.current?.close();
    },
    []
  );

  return (
    <section id="soundscape" className="relative mx-auto w-full max-w-6xl px-6 py-28 md:py-36">
      <header className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-lilac-300/80">Ritual IV</p>
        <h2 className="font-display mt-3 text-4xl font-light text-ember-100 md:text-5xl">The soundscape</h2>
        <p className="mt-4 text-pretty text-lg font-light leading-relaxed text-ember-100/65">
          Three small worlds of sound, synthesized live in your browser. No recordings — just
          mathematics pretending to be weather.
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass ring-glow rounded-[2rem] p-8 md:p-10"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {SCENES.map(({ key, label, blurb, icon: Icon }) => {
            const active = scene === key && playing;
            return (
              <button
                key={key}
                onClick={() => chooseScene(key)}
                className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300 ${
                  active
                    ? "border-ember-300/40 bg-ember-400/[0.08] shadow-[0_0_36px_rgba(255,179,92,0.16)]"
                    : "border-ember-100/10 bg-ember-100/[0.02] hover:border-ember-100/25 hover:bg-ember-100/[0.05]"
                }`}
              >
                <Icon
                  className={`h-6 w-6 transition-colors ${active ? "text-ember-300" : "text-ember-100/50 group-hover:text-ember-200/80"}`}
                  strokeWidth={1.5}
                />
                <p className="font-display mt-4 text-lg font-light text-ember-100">{label}</p>
                <p className="mt-1 text-[13.5px] font-light text-ember-100/55">{blurb}</p>
                {active && (
                  <span className="absolute right-5 top-5 flex items-end gap-[3px]" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-[3px] rounded-full bg-ember-300/90"
                        style={{
                          height: 14,
                          transformOrigin: "bottom",
                          animation: `pulseSoft ${0.9 + i * 0.25}s ease-in-out ${i * 0.15}s infinite`,
                        }}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <button
            onClick={toggle}
            className="btn-ember inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-[15px] font-semibold"
          >
            {playing ? <Pause className="h-4.5 w-4.5" strokeWidth={2} /> : <Play className="h-4.5 w-4.5" strokeWidth={2} />}
            {playing ? "Pause the world" : "Play the world"}
          </button>

          <label className="flex w-full max-w-xs items-center gap-3">
            <span className="text-[13px] text-ember-100/50">Soft</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              aria-label="Soundscape volume"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ember-100/15 accent-ember-400"
            />
            <span className="text-[13px] text-ember-100/50">Warm</span>
          </label>
        </div>
      </motion.div>
    </section>
  );
}
