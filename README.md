# Lumen — A Small Ritual of Light

A serene, ambient web experience designed to evoke calm, warmth, and wonder.

## The rituals

- **The breathing ritual** — a 4-7-8 guided breath with a glowing orb, phase timeline, cycle counter, and a soft tone marking each phase (Web Audio).
- **A sky of small joys** — plant the day's small happinesses as glowing star blossoms in an interactive night sky. They persist in your browser; copy a shareable list anytime.
- **Reflections** — a deck of kind sentences that feel like being told something good about yourself, plus a gratitude jar for today's small thanks.
- **The soundscape** — three generative sound worlds (firelight, rainfall, night air) synthesized live with the Web Audio API. No recordings, no network calls.

## The atmosphere

A living aurora drifts across deep night blue behind everything, layered with a twinkling star field, film grain, glass panels, and a warm ember-and-sage palette. Typography pairs Fraunces (display serif) with Inter (body). Time-aware greetings meet you at the door; a kind sign-off sees you out.

Everything runs client-side — no backend, no keys, no tracking.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (custom design tokens in `src/index.css`)
- Framer Motion for motion design
- lucide-react icons
- Web Audio API for sound

## Commands

```bash
bun install
bun run dev        # start dev server (0.0.0.0)
bun run build      # production build to dist/
bun run typecheck  # tsc -b --noEmit
```
