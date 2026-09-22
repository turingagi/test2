import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

type Phase = { key: "inhale" | "hold" | "exhale" | "rest"; label: string; secs: number };

const PHASES: Phase[] = [
  { key: "inhale", label: "Breathe in", secs: 4 },
  { key: "hold", label: "Hold", secs: 7 },
  { key: "exhale", label: "Breathe out", secs: 8 },
  { key: "rest", label: "Rest", secs: 2 },
];

function tone(ctx: AudioContext, freq: number, dur: number, gain = 0.05) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.1);
}

export default function BreathingRitual() {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [remaining, setRemaining] = useState(PHASES[0].secs);
  const [cycles, setCycles] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        setPhaseIdx((i) => {
          const next = (i + 1) % PHASES.length;
          if (next === 0) setCycles((c) => 4 - 4 + c + 1);
          const p = PHASES[next];
          setRemaining(p.secs);
          const ctx = audioRef.current;
          if (ctx && ctx.state === "running") {
            const freqs = { inhale: 392, hold: 440, exhale: 329.6, rest: 261.6 } as const;
            tone(ctx, freqs[p.key], p.key === "exhale" ? 1.6 : 0.9, 0.045);
          }
          return p.secs;
        });
        return 0;
      });
      return 0;
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = () => {
    if (!audioRef.current) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioRef.current = new Ctor();
    }
    void audioRef.current.resume();
    setRunning(true);
  };

  const stop = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setPhaseIdx(0);
    setRemaining(PHASES[0].secs);
    setCycles(0);
  };

  const phase = PHASES[phaseIdx];
  const progress = 1 - remaining / phase.secs;

  return (
    <section id="breathe" className="relative mx-auto w-full max-w-6xl px-6 py-28 md:py-36">
      <header className="mx-auto mb-14 max-w-2xl text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-sage-300/80">Ritual I</p>
        <h2 className="font-display mt-3 text-4xl font-light text-ember-100 md:text-5xl">The breathing ritual</h2>
        <p className="mt-4 text-pretty text-lg font-light leading-relaxed text-ember-100/65">
          Four in, seven held, eight out — the 4-7-8 rhythm your nervous system already trusts.
          Follow the orb. One minute is enough.
        </p>
      </header>

      <div className="grid items-center gap-12 md:grid-cols-[1fr_auto] md:gap-16">
        <div className="order-2 space-y-8 md:order-1">
          <div className="glass ring-glow-sage rounded-3xl p-8 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12px] uppercase tracking-[0.2em] text-ember-100/45">Now</p>
                <p className="font-display mt-1 text-2xl font-light text-ember-100">{phase.label}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] uppercase tracking-[0.2em] text-ember-100/45">Completed</p>
                <p className="font-display mt-1 text-2xl font-light text-sage-300">
                  {cycles} {cycles === 1 ? "breath" : "breaths"}
                </p>
              </div>
 </div>

            {/* Phase timeline */}
            <div className="mt-8 flex gap-2" aria-hidden="true">
              {PHASES.map((p, i) => (
                <div key={p.key} className="flex-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-ember-100/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sage-400 to-sage-300 transition-all duration-1000 ease-linear"
                      style={{
                        width: i < phaseIdx ? "100%" : i === phaseIdx ? `${progress * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <p className={`mt-2 text-[11px] tracking-wide ${i === phaseIdx ? "text-sage-300" : "text-ember-100/40"}`}>
                    {p.label} · {p.secs}s
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              {!running ? (
                <button onClick={start} className="btn-ember inline-flex items-center gap-2 rounded-full px-7 py-3 text-[15px] font-semibold">
                  <Play className="h-4 w-4" strokeWidth={2} /> Begin breathing
                </button>
              ) : (
                <button onClick={stop} className="btn-ghost inline-flex items-center gap-2 rounded-full px-7 py-3 text-[15px] font-medium text-ember-100">
                  <Pause className="h-4 w-4" strokeWidth={1.75} /> Pause
                </button>
              )}
              <button onClick={reset} className="btn-ghost inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] text-ember-100/75">
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> Reset
              </button>
              <p className="text-[13px] text-ember-100/45">A soft tone marks each phase.</p>
            </div>
          </div>
        </div>

        {/* The orb */}
        <div className="order-1 flex justify-center md:order-2">
          <div className="relative flex h-[340px] w-[340px] items-center justify-center sm:h-[380px] sm:w-[380px]">
            <div className="absolute inset-0 rounded-full border border-ember-100/10" />
            <div className="absolute inset-6 rounded-full border border-ember-100/[0.07]" />
            {/* main breathing orb */}
            <div
              className="relative grid place-items-center rounded-full transition-transform duration-[1400ms] ease-in-out"
              style={{
                width: phase.key === "hold" ? 230 : 240,
                height: phase.key === "hold" ? 230 : 240,
                transform: `scale(${running ? (phase.key === "inhale" ? 0.8 + progress * 0.3 : phase.key === "hold" ? 1.1 : 1.1 - progress * 0.3) : 0.86})`,
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ember-200/70 via-ember-400/35 to-ember-600/10 blur-xl" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ember-100/90 via-ember-300/60 to-ember-500/20 blur-md" />
              <div className="relative grid h-full w-full place-items-center rounded-full bg-gradient-to-b from-ember-200 via-ember-400/70 to-ember-600/30 shadow-[0_0_90px_rgba(255,179,92,0.35)]">
                <span className="font-display text-4xl font-light text-night-900/85 tabular-nums">
                  {remaining}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
