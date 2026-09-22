import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const CLOSINGS = [
  "Go gently. You did enough today.",
  "Take the long way home if you can.",
  "Whatever tonight holds, you've already met harder.",
  "Drink some water. Look at the moon if it's out.",
  "The light will come back. It always does.",
];

export default function Closing() {
  const [line] = useState(() => CLOSINGS[Math.floor(Math.random() * CLOSINGS.length)]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <footer className="relative overflow-hidden px-6 pb-14 pt-24">
      {/* horizon glow */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46vh]">
        <div className="absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(60%_90%_at_50%_100%,rgba(255,179,92,0.16),rgba(167,139,250,0.07)_45%,transparent_75%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ember-300/40 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="animate-breathe-slow mx-auto mb-8 h-16 w-16 rounded-full bg-gradient-to-b from-ember-200/90 to-ember-500/30 blur-[1px]" />
          <p className="font-display text-balance text-3xl font-light leading-snug text-gradient-ember md:text-4xl">
            {line}
          </p>
          <p className="mt-6 text-[14px] font-light text-ember-100/50">
            It is {time} where you are. Lumen will keep the sky until then.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#breathe"
              className="btn-ember inline-flex items-center gap-2 rounded-full px-7 py-3 text-[15px] font-semibold"
            >
              Breathe once more
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </a>
            <a
              href="#top"
              className="btn-ghost inline-flex items-center gap-2 rounded-full px-7 py-3 text-[15px] font-medium text-ember-100/85"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              Back to the beginning
            </a>
          </div>
        </motion.div>
      </div>

      <div className="relative mt-20 flex flex-col items-center gap-2 text-center">
        <p className="font-display text-lg font-light tracking-wide text-ember-100/70">Lumen</p>
        <p className="text-[12.5px] font-light text-ember-100/35">
          A small ritual of light · made with quiet intention
        </p>
      </div>
    </footer>
  );
}
