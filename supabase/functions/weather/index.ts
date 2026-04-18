// SmartWeather Pro — weather proxy (current + forecast + AQI + geocoding)
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const OWM = "https://api.openweathermap.org";
const KEY = Deno.env.get("OPENWEATHER_API_KEY");

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
  });

async function fetchJson(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Upstream ${r.status}: ${await r.text()}`);
  return r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!KEY) return json({ error: "OPENWEATHER_API_KEY not configured" }, 500);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "weather";

    if (action === "geocode") {
      const q = url.searchParams.get("q")?.trim();
      if (!q) return json({ error: "Missing q" }, 400);
      const data = await fetchJson(
        `${OWM}/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${KEY}`,
      );
      return json(data);
    }

    if (action === "reverse") {
      const lat = url.searchParams.get("lat");
      const lon = url.searchParams.get("lon");
      if (!lat || !lon) return json({ error: "Missing lat/lon" }, 400);
      const data = await fetchJson(
        `${OWM}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${KEY}`,
      );
      return json(data);
    }

    // default: weather bundle
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
    const units = url.searchParams.get("units") ?? "metric";
    if (!lat || !lon) return json({ error: "Missing lat/lon" }, 400);

    const [current, forecast, air] = await Promise.all([
      fetchJson(`${OWM}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${KEY}`),
      fetchJson(`${OWM}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${KEY}`),
      fetchJson(`${OWM}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${KEY}`),
    ]);

    return json({ current, forecast, air, units });
  } catch (e) {
    console.error("weather error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
