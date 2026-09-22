import { useCallback, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { MoonStar, Sparkles } from "lucide-react";
import AuroraCanvas from "./components/AuroraCanvas";
import Hero from "./components/Hero";
import BreathingRitual from "./components/BreathingRitual";
import NightSky from "./components/NightSky";
import Reflections from "./components/Reflections";
import Soundscape from "./components/Soundscape";
import Closing from "./components/Closing";

export default function App() {
  const [soundHint, setSoundHint] = useState(true);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div id="top" className="relative min-h-screen">
      {/* reading progress */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-sage-400 via-ember-300 to-lilac-400"
      />

      <AuroraCanvas />
      <div className="star-field pointer-events-none fixed inset-0 z-0 opacity-40" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_55%,rgba(4,7,12,0.75))]" />

      {/* Nav */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed inset-x-0 top-0 z-40"
      >
        <div className="glass-strong mx-auto mt-4 flex w-[min(94%,58rem)] items-center justify-between rounded-full px-5 py-2.5">
          <button onClick={() => scrollTo("top")} className="flex items-center gap-2.5">
            <span className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-b from-ember-200 to-ember-500 shadow-[0_0_18px_rgba(255,179,92,0.5)]">
              <MoonStar className="h-4 w-4 text-night-900" strokeWidth={2} />
            </span>
            <span className="font-display text-[17px] font-medium tracking-wide text-ember-100">Lumen</span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              { id: "breathe", label: "Breathe" },
              { id: "sky", label: "Night sky" },
              { id: "reflections", label: "Reflections" },
              { id: "soundscape", label: "Soundscape" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="rounded-full px-4 py-2 text-[13.5px] font-light text-ember-100/65 transition-colors hover:bg-ember-100/[0.06] hover:text-ember-100"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => scrollTo("breathe")}
            className="btn-ember inline-flex items-center gap-1.5 rounded-full px-4.5 py-2 text-[13px] font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            Begin
          </button>
        </div>
      </motion.header>

      {/* Content */}
      <main className="relative z-10">
        <Hero onBegin={() => scrollTo("breathe")} />
        <BreathingRitual />
        <NightSky />
        <Reflections />
        <Soundscape />
        <Closing />
      </main>

      {/* one-time sound hint */}
      {soundHint && (
        <button
          onClick={() => setSoundHint(false)}
          className="glass-strong fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-2.5 text-[13px] text-ember-100/80 transition-transform hover:scale-[1.02]"
        >
          <Sparkles className="h-3.5 w-3.5 text-ember-300" strokeWidth={1.75} />
          Sound is off until you invite it — tap the soundscape when you're ready
          <span className="ml-1 text-ember-100/40">✕</span>
        </button>
      )}
    </div>
  );
}
