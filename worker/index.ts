import { REFLECTIONS } from "../src/data/reflections";

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS, ...extraHeaders },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // API surface
    if (url.pathname === "/api/health") {
      return json({
        status: "ok",
        app: "lumen",
        time: new Date().toISOString(),
        ray: request.headers.get("cf-ray") ?? null,
      });
    }

    if (url.pathname === "/api/reflections") {
      return json({
        count: REFLECTIONS.length,
        reflection: REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)],
        all: REFLECTIONS,
      });
    }

    if (url.pathname === "/api/joy-planting-spots" && request.method === "GET") {
      // Deterministic-ish playful seed for the night sky
      return json({
        count: 3,
        spots: Array.from({ length: 3 }, (_, i) => ({
          x: 10 + Math.floor(Math.random() * 80),
          y: 10 + Math.floor(Math.random() * 70),
          note: i === 0 ? "a good place to begin" : undefined,
        })),
      });
    }

    // Everything else: SPA assets with index.html fallback
    try {
      return await env.ASSETS.fetch(request);
    } catch {
      return json({ error: "asset_not_found", path: url.pathname }, 404);
    }
  },
} satisfies ExportedHandler<Env>;
