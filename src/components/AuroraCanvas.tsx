import { useEffect, useRef } from "react";

type Blob = { x: number; y: number; r: number; hue: number; s: number; l: number; sx: number; sy: number; phase: number };

/**
 * Living aurora: soft radial light blobs drifting over deep night blue.
 * Layered underneath every section for a calm, alive atmosphere.
 */
export default function AuroraCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const blobs: Blob[] = [];
    const palette = [
      { h: 165, s: 45, l: 45 }, // sage
      { h: 210, s: 60, l: 40 }, // steel blue
      { h: 268, s: 45, l: 52 }, // lilac
      { h: 24, s: 80, l: 55 },  // ember
      { h: 190, s: 50, l: 45 }, // teal
    ];

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#070b12";
      ctx.fillRect(0, 0, w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 6; i++) {
      const p = palette[i % palette.length];
      blobs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.min(w, h) * (0.45 + Math.random() * 0.35),
        hue: p.h + (Math.random() * 14 - 7),
        s: p.s,
        l: p.l,
        sx: (Math.random() * 2 - 1) * 0.12,
        sy: (Math.random() * 2 - 1) * 0.08,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let t = 0;
    const draw = () => {
      t += 0.0016;
      // Fade previous frame instead of clearing — creates silky trails
      ctx.fillStyle = "rgba(7, 11, 18, 0.045)";
      ctx.fillRect(0, 0, w, h);

      for (const b of blobs) {
        b.x += b.sx + Math.sin(t * 2.2 + b.phase) * 0.18;
        b.y += b.sy + Math.cos(t * 1.7 + b.phase) * 0.12;
        if (b.x < -b.r * 0.6) b.x = w + b.r * 0.6;
        if (b.x > w + b.r * 0.6) b.x = -b.r * 0.6;
        if (b.y < -b.r * 0.6) b.y = h + b.r * 0.6;
        if (b.y > h + b.r * 0.6) b.y = -b.r * 0.6;

        const pulse = 1 + Math.sin(t * 1.4 + b.phase) * 0.12;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * pulse);
        g.addColorStop(0, `hsla(${b.hue}, ${b.s}%, ${b.l + 8}%, 0.16)`);
        g.addColorStop(0.55, `hsla(${b.hue}, ${b.s}%, ${b.l}%, 0.07)`);
        g.addColorStop(1, "hsla(0, 0%, 0%, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-80"
    />
  );
}
