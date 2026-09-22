import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";

function greetingFor(hour: number): { text: string; sub: string } {
  if (hour >= 5 && hour < 12) return { text: "Good morning", sub: "The light is just arriving." };
  if (hour < 17) return { text: "Good afternoon", sub: "A pause, here in the middle of things." };
  if (hour < 22) return { text: "Good evening", sub: "The sky is doing its slow work." };
  return { text: "Good night", sub: "The world has softened. So can you." };
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function Hero({ onBegin }: { onBegin: () => void }) {
  const [greeting, setGreeting] = useState(() => greetingFor(new Date().getHours()));
  useEffect(() => {
    const id = setInterval(() => setGreeting(greetingFor(new Date().getHours())), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      {/* Halo behind everything */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[62vmin] w-[62vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-[62%] h-[38vmin] w-[46vmin] -translate-x-1/2 rounded-full bg-lilac-400/10 blur-3xl" />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.1 }}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-ember-200/15 bg-ember-200/5 px-4 py-1.5 text-[13px] tracking-wide text-ember-200/90"
      >
        <Sparkles className="h-3.5 w-3.5 text-ember-300" strokeWidth={1.75} />
        {todayLabel()} — a quiet place, kept for you
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.25 }}
        className="font-display text-[13vw] font-light leading-[1.02] tracking-tight text-ember-100 sm:text-7xl md:text-8xl"
      >
        {greeting.text}.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.45 }}
        className="mt-5 max-w-xl text-balance text-lg font-light leading-relaxed text-ember-100/70"
      >
        {greeting.sub} You've arrived at <span className="text-ember-200/95">Lumen</span> — a small
        ritual of light. Stay a minute. Breathe with the orb, plant a joy in the sky, and take one
        kind sentence with you.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.65 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <button
          onClick={onBegin}
          className="btn-ember rounded-full px-8 py-3.5 text-[15px] font-semibold tracking-wide"
        >
          Begin the ritual
        </button>
        <a href="#sky" className="btn-ghost rounded-full px-7 py-3.5 text-[15px] font-medium text-ember-100/90">
          Visit the night sky
        </a>
        <a
          href="#reflections"
          className="group inline-flex items-center gap-2 px-2 py-3 text-[15px] text-ember-100/60 transition-colors hover:text-ember-100"
        >
          Just the reflections
          <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" strokeWidth={1.75} />
        </a>
      </motion.div>

      {/* Ambient orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.5 }}
        className="pointer-events-none absolute bottom-[8%] left-1/2 -translate-x-1/2"
      >
        <div className="animate-breathe-slow h-24 w-24 rounded-full bg-gradient-to-b from-ember-200/80 via-ember-400/40 to-transparent blur-[2px]" />
        <div className="absolute inset-0 m-auto h-40 w-40 -translate-y-10 rounded-full bg-ember-400/10 blur-2xl" />
      </motion.div>
    </section>
 );
}
