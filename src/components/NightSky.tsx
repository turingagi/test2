import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star, Trash2, Check, Copy } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type Joy = { id: number; x: number; y: number; label: string; plantedAt: number };

const PROMPTS = [
  "Warm sun through a window",
  "A message you didn't expect",
  "Your favorite song, remembered",
  "The smell of rain",
  "Someone laughed at your joke",
  "Clean sheets tonight",
  "A walk that went too long, on purpose",
  "The first sip of coffee",
  "An old photo that made you smile",
  "Silence after a long day",
];

function seedFromText(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function NightSky() {
  const [joys, setJoys] = useLocalStorage<Joy[]>("lumen.joys.v1", []);
  const [draft, setDraft] = useState("");
  const [plantedMsg, setPlantedMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const suggestion = useMemo(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)], []);

  // Ambient twinkle canvas behind the sky
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.3,
      speed: 0.4 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 247, 230, ${tw * 0.8})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const plant = (label: string) => {
    const text = label.trim();
    if (!text || text.length > 80) return;
    const seed = seedFromText(text);
    const joy: Joy = {
      id: seed + Date.now(),
      x: 6 + (seed % 88),
      y: 10 + ((seed >> 3) % 70),
      label: text,
      plantedAt: Date.now(),
    };
    setJoys((prev) => [...prev, joy].slice(-24));
    setPlantedMsg(text);
    setDraft("");
    window.setTimeout(() => setPlantedMsg(null), 2600);
  };

  const clearAll = () => {
    setJoys([]);
  };

  const shareText = () => {
    if (joys.length === 0) return "My sky at Lumen is waiting for its first joy.";
    return `My night sky at Lumen holds ${joys.length} small ${joys.length === 1 ? "joy" : "joys"}:\n` +
      joys.map((j) => `· ${j.label}`).join("\n");
  };

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section id="sky" ref={sectionRef} className="relative mx-auto w-full max-w-6xl px-6 py-28 md:py-36">
      <header className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-lilac-300/80">Ritual II</p>
        <h2 className="font-display mt-3 text-4xl font-light text-ember-100 md:text-5xl">A sky of small joys</h2>
        <p className="mt-4 text-pretty text-lg font-light leading-relaxed text-ember-100/65">
          Name one good thing from your day and plant it here. Each joy becomes a star blossom that
          stays — the sky is kept in this browser, quietly, just for you.
        </p>
      </header>

      <div className="glass-strong ring-glow relative overflow-hidden rounded-[2rem] p-4 sm:p-6">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full rounded-[2rem]" />
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-b from-night-900/10 via-transparent to-night-950/50" />

        <div className="relative min-h-[420px] rounded-3xl sm:min-h-[480px]">
          {/* The planted joys */}
          <AnimatePresence>
            {joys.map((j) => (
              <motion.button
                key={j.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.2, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                onClick={() => plant(j.label)}
                title={`${j.label} — click to plant another`}
                className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${j.x}%`, top: `${j.y}%` }}
              >
                <span className="block h-8 w-8 rounded-full bg-ember-300/25 shadow-[0_0_24px_rgba(255,214,145,0.45)] transition-transform group-hover:scale-125">
                  <span className="grid h-full w-full place-items-center">
                    <span className="block h-2.5 w-2.5 rounded-full bg-gradient-to-b from-ember-100 to-ember-400 shadow-[0_0_12px_rgba(255,232,189,0.9)]" />
                  </span>
                </span>
                <span className="absolute left-1/2 top-full mt-1.5 w-max max-w-[180px] -translate-x-1/2 rounded-full border border-ember-100/10 bg-night-900/85 px-3 py-1 text-[11px] font-light text-ember-100/85 opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                  {j.label}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>

          {joys.length === 0 && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <p className="text-balance text-center font-display text-xl font-light italic text-ember-100/40">
                An empty sky, waiting for tonight's small happiness…
              </p>
            </div>
          )}

          {/* Planting form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              plant(draft);
            }}
            className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3"
          >
            <AnimatePresence>
              {plantedMsg && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-full border border-sage-400/25 bg-sage-500/15 px-4 py-1.5 text-[13px] text-sage-100"
                >
                  Planted · “{plantedMsg}” now glows above
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex w-full max-w-xl items-center gap-2 rounded-full border border-ember-100/12 bg-night-900/80 p-2 pl-5 backdrop-blur">
              <Star className="h-4 w-4 shrink-0 text-ember-300" strokeWidth={1.75} />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={80}
                placeholder={`e.g. ${suggestion}`}
                aria-label="Name a small joy to plant in the sky"
                className="w-full bg-transparent text-[15px] font-light text-ember-100 placeholder:text-ember-100/35 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="btn-ember shrink-0 rounded-full px-5 py-2.5 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Plant it
              </button>
            </div>
            <div className="flex items-center gap-5 pb-1 text-[12.5px] text-ember-100/40">
              <span>{joys.length} {joys.length === 1 ? "joy" : "joys"} in the sky</span>
              <button type="button" onClick={copyShare} className="inline-flex items-center gap-1.5 transition-colors hover:text-ember-100/80">
                {copied ? <Check className="h-3.5 w-3.5 text-sage-300" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Share my sky"}
              </button>
              {joys.length > 0 && (
                <button type="button" onClick={clearAll} className="inline-flex items-center gap-1.5 transition-colors hover:text-rose-300">
                  <Trash2 className="h-3.5 w-3.5" /> Let them go
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
