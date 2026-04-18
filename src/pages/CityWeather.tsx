import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { WeatherView } from "@/components/WeatherView";
import { WeatherSkeleton } from "@/components/WeatherSkeleton";
import { CitySearch } from "@/components/CitySearch";
import { AdSlot } from "@/components/AdSlot";
import { weatherApi, type WeatherBundle } from "@/lib/weather-api";
import { parseCitySlug } from "@/lib/format";

const CityWeather = () => {
  const { slug = "" } = useParams();
  const [params] = useSearchParams();
  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { name, country } = parseCitySlug(slug);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBundle(null); setErr(null);
      try {
        let lat = parseFloat(params.get("lat") ?? "");
        let lon = parseFloat(params.get("lon") ?? "");
        if (isNaN(lat) || isNaN(lon)) {
          const geo = await weatherApi.geocode(`${name},${country}`);
          if (!geo[0]) throw new Error(`Could not find ${name}`);
          lat = geo[0].lat; lon = geo[0].lon;
        }
        const b = await weatherApi.bundle(lat, lon);
        if (!cancelled) setBundle(b);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => { cancelled = true; };
  }, [slug, params, name, country]);

  const title = bundle ? `${bundle.current.name} Weather — ${Math.round(bundle.current.main.temp)}°C, ${bundle.current.weather[0]?.description}` : `${name} Weather`;
  const desc = bundle
    ? `Current weather in ${bundle.current.name}: ${Math.round(bundle.current.main.temp)}°C, ${bundle.current.weather[0]?.description}. Humidity ${bundle.current.main.humidity}%, wind ${bundle.current.wind.speed} m/s. 7-day forecast and AQI included.`
    : `Real-time weather forecast for ${name}.`;

  return (
    <PageLayout title={title} description={desc} canonical={typeof window !== "undefined" ? window.location.href : undefined}>
      <section className="container pt-8 pb-6">
        <CitySearch />
      </section>
      <section className="container">
        <AdSlot variant="banner" className="mb-6" />
        {err && <div className="glass rounded-2xl p-6 text-destructive">{err}</div>}
        {!bundle && !err && <WeatherSkeleton />}
        {bundle && <WeatherView bundle={bundle} />}
        <AdSlot variant="in-content" className="mt-6" />
      </section>
    </PageLayout>
  );
};

export default CityWeather;
