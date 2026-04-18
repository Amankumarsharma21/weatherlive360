import { supabase } from "@/integrations/supabase/client";

export type Units = "metric" | "imperial";

export interface CurrentWeather {
  name: string;
  dt: number;
  timezone: number;
  sys: { country: string; sunrise: number; sunset: number };
  coord: { lat: number; lon: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  main: { temp: number; feels_like: number; humidity: number; pressure: number; temp_min: number; temp_max: number };
  wind: { speed: number; deg: number };
  visibility: number;
  clouds: { all: number };
}

export interface ForecastItem {
  dt: number;
  main: { temp: number; feels_like: number; humidity: number; temp_min: number; temp_max: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  wind: { speed: number };
  pop: number;
  dt_txt: string;
}

export interface AirData {
  list: { main: { aqi: 1 | 2 | 3 | 4 | 5 }; components: Record<string, number>; dt: number }[];
}

export interface WeatherBundle {
  current: CurrentWeather;
  forecast: { list: ForecastItem[]; city: { name: string; country: string; timezone: number } };
  air: AirData;
  units: Units;
}

export interface GeoResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

async function call<T>(params: Record<string, string>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("weather", {
    method: "GET",
    // edge function reads URL params; supabase-js puts body in POST so we use a query string trick:
  });
  // The above invoke does not support GET params reliably; use direct fetch instead:
  void data; void error;
  throw new Error("unused");
}
// Direct fetch using Cloud env so we can pass query params cleanly.
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weather`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

async function weatherFetch<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${FN_URL}?${qs}`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
  return j as T;
}

export const weatherApi = {
  geocode: (q: string) => weatherFetch<GeoResult[]>({ action: "geocode", q }),
  reverse: (lat: number, lon: number) =>
    weatherFetch<GeoResult[]>({ action: "reverse", lat: String(lat), lon: String(lon) }),
  bundle: (lat: number, lon: number, units: Units = "metric") =>
    weatherFetch<WeatherBundle>({ lat: String(lat), lon: String(lon), units }),
};

// Suppress the unused helper
void call;
