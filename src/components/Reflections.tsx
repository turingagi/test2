import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Heart, Feather } from "lucide-react";
import { REFLECTIONS } from "../data/reflections";

const GRATITUDE_SEEDS = [
  "My body carried me here.",
  "This morning's quiet.",
  "Someone's small kindness.",
  "A song that felt like mine.",
  "Light on the wall at 5pm.",
  "Air that finally cooled.",
];

export default function Reflections() {
  const [index, setIndex] = useState(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    return day % REFLECTIONS.length;
  });
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [gratitude, setGratitude] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const direction = useMemo(() => 1, []);
  const current = REFLECTIONS[index];

  const go = (delta: number) => {
    setIndex((i) => (i + delta + REFLECTIONS.length) % REFLECTIONS.length);
  };

  const toggleSave = (text: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  };

  const addGratitude = () => {
    const text = draft.trim();
    if (!text) return;
    setGratitude((prev) => [...prev, text].slice(-6));
    setDraft("");
  };

  return (
    <section id="reflections" className="relative mx-auto w-full max-w-6xl px-6 py-28 md:py-36">
      <header className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-ember-300/75">Ritual III</p>
        <h2 className="font-display mt-3 text-4xl font-light text-ember-100 md:text-5xl">Reflections, kept warm</h2>
        <p className="mt-4 text-pretty text-lg font-light leading-relaxed text-ember-100/65">
          Sentences that feel like being told something kind. Keep the ones that land — and leave one
          grain of gratitude for today.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        {/* Card deck */}
        <div className="glass ring-glow relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-3xl p-8 md:p-10">
          <Quote className="absolute right-8 top-8 h-10 w-10 text-ember-200/10" strokeWidth={1} aria-hidden="true" />

          <div className="relative flex-1 pt-6">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={index}
                initial={{ opacity: 0, x: direction * 36, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: direction * -36, filter: "blur(6px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-2xl font-light leading-snug text-ember-100 md:text-[28px]"
              >
                “{current}”
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => go(-1)}
                aria-label="Previous reflection"
                className="btn-ghost grid h-11 w-11 place-items-center rounded-full text-ember-100/80"
              >
                <ChevronLeft className="h-4.5 w-4.5" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next reflection"
                className="btn-ghost grid h-11 w-11 place-items-center rounded-full text-ember-100/80"
              >
                <ChevronRight className="h-4.5 w-4.5" strokeWidth={1.75} />
              </button>
              <span className="ml-2 text-[13px] tabular-nums text-ember-100/40">
                {index + 1} / {REFLECTIONS.length}
              </span>
            </div>
            <button
              onClick={() => toggleSave(current)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all ${
                saved.has(current)
                  ? "border border-rose-300/30 bg-rose-300/10 text-rose-glow"
                  : "btn-ghost text-ember-100/85"
              }`}
            >
              <Heart className={`h-4 w-4 ${saved.has(current) ? "fill-current" : ""}`} strokeWidth={1.75} />
              {saved.has(current) ? "Kept" : "Keep this"}
            </button>
          </div>

          {/* dots */}
          <div className="mt-6 flex justify-center gap-1.5" aria-hidden="true">
            {REFLECTIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to reflection ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-ember-300" : "w-1.5 bg-ember-100/20 hover:bg-ember-100/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Gratitude jar */}
        <div className="glass ring-glow flex flex-col rounded-3xl p-8 md:p-10">
          <div className="flex items-center gap-3">
            <Feather className="h-5 w-5 text-sage-300" strokeWidth={1.5} />
            <h3 className="font-display text-xl font-light text-ember-100">The gratitude jar</h3>
          </div>
          <p className="mt-3 text-[15px] font-light leading-relaxed text-ember-100/60">
            Small stones of thanks for today. Drop in as many as you like — they stay through
            your visit.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addGratitude();
            }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 rounded-full border border-ember-100/12 bg-night-900/70 p-1.5 pl-4">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={60}
                placeholder={GRATITUDE_SEEDS[gratitude.length % GRATITUDE_SEEDS.length]}
                aria-label="A grain of gratitude"
                className="w-full bg-transparent text-[15px] font-light text-ember-100 placeholder:text-ember-100/35 focus:outline-none"
              />
              <button type="submit" className="btn-ember shrink-0 rounded-full px-4 py-2 text-[13.5px] font-semibold">
                Drop in
              </button>
            </div>
          </form>

          <ul className="mt-6 flex-1 space-y-2.5 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {gratitude.map((g, i) => (
                <motion.li
                  key={`${g}-${i}`}
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center gap-3 rounded-2xl border border-sage-400/15 bg-sage-500/[0.07] px-4 py-3"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-sage-200 to-sage-400 shadow-[0_0_10px_rgba(143,196,156,0.6)]" />
                  <span className="text-[14.5px] font-light text-sage-100">{g}</span>
                </motion.li>
              ))}
            </AnimatePresence>
            {gratitude.length === 0 && (
              <li className="rounded-2xl border border-dashed border-ember-100/12 px-4 py-6 text-center text-[13.5px] font-light italic text-ember-100/35">
                The jar is empty — even “the weather was kind” counts.
              </li>
            )}
          </ul>
          {gratitude.length > 0 && (
            <p className="mt-4 text-center text-[12.5px] text-sage-300/70">
              {gratitude.length} grain{gratitude.length === 1 ? "" : "s"} of thanks today
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
