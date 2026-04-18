// SmartWeather Pro — weather proxy (current + forecast + AQI + geocoding)
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const OWM = "https://api.openweathermap.org";
const KEY = Deno.env.get("OPENWEATHER_API_KEY");
const ALLOWED_UNITS = new Set(["metric", "imperial", "standard"]);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
  });

async function fetchJson(url: URL) {
  const r = await fetch(url.toString());
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    // Log full upstream details server-side only
    console.error(`Upstream ${r.status} for ${url.pathname}: ${body}`);
    const err = new Error(`UPSTREAM_${r.status}`);
    (err as Error & { status?: number }).status = r.status;
    throw err;
  }
  return r.json();
}

function parseLatLon(latStr: string | null, lonStr: string | null) {
  if (!latStr || !lonStr) return null;
  const lat = Number(latStr);
  const lon = Number(lonStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

function buildUrl(path: string, params: Record<string, string>) {
  const u = new URL(`${OWM}${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set("appid", KEY!);
  return u;
}

function mapUpstreamError(e: unknown): { message: string; status: number } {
  const status = (e as { status?: number })?.status;
  if (status === 404) return { message: "Location not found.", status: 404 };
  if (status === 401 || status === 403) return { message: "Weather service unavailable.", status: 502 };
  if (status === 429) return { message: "Weather service is busy. Please try again shortly.", status: 503 };
  return { message: "Unable to fetch weather data. Please try again.", status: 502 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!KEY) {
    console.error("OPENWEATHER_API_KEY not configured");
    return json({ error: "Service is not configured." }, 500);
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "weather";

    if (action === "geocode") {
      const q = url.searchParams.get("q")?.trim();
      if (!q || q.length > 200) return json({ error: "Invalid query." }, 400);
      const data = await fetchJson(buildUrl("/geo/1.0/direct", { q, limit: "5" }));
      return json(data);
    }

    if (action === "reverse") {
      const coords = parseLatLon(url.searchParams.get("lat"), url.searchParams.get("lon"));
      if (!coords) return json({ error: "Invalid coordinates." }, 400);
      const data = await fetchJson(
        buildUrl("/geo/1.0/reverse", { lat: String(coords.lat), lon: String(coords.lon), limit: "1" }),
      );
      return json(data);
    }

    // default: weather bundle
    const coords = parseLatLon(url.searchParams.get("lat"), url.searchParams.get("lon"));
    if (!coords) return json({ error: "Invalid coordinates." }, 400);
    const unitsParam = url.searchParams.get("units") ?? "metric";
    const units = ALLOWED_UNITS.has(unitsParam) ? unitsParam : "metric";

    const params = { lat: String(coords.lat), lon: String(coords.lon), units };

    const [current, forecast, air] = await Promise.all([
      fetchJson(buildUrl("/data/2.5/weather", params)),
      fetchJson(buildUrl("/data/2.5/forecast", params)),
      fetchJson(buildUrl("/data/2.5/air_pollution", { lat: params.lat, lon: params.lon })),
    ]);

    return json({ current, forecast, air, units });
  } catch (e) {
    console.error("weather error", e);
    const { message, status } = mapUpstreamError(e);
    return json({ error: message }, status);
  }
});
