import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { CitySearch } from "@/components/CitySearch";
import { WeatherView } from "@/components/WeatherView";
import { WeatherSkeleton } from "@/components/WeatherSkeleton";
import { AdSlot } from "@/components/AdSlot";
import { weatherApi, type WeatherBundle } from "@/lib/weather-api";
import { useFavorites } from "@/hooks/use-favorites";
import { Link } from "react-router-dom";
import { Sparkles, MapPin, Activity } from "lucide-react";

const POPULAR = [
  { name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
  { name: "New York", country: "US", lat: 40.7128, lon: -74.006 },
  { name: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503 },
  { name: "Delhi", country: "IN", lat: 28.6139, lon: 77.209 },
  { name: "Paris", country: "FR", lat: 48.8566, lon: 2.3522 },
  { name: "Sydney", country: "AU", lat: -33.8688, lon: 151.2093 },
];

const Index = () => {
  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { favorites } = useFavorites();

  // Auto-detect on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      loadCity(POPULAR[0].lat, POPULAR[0].lon);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => loadCity(pos.coords.latitude, pos.coords.longitude),
      () => loadCity(POPULAR[0].lat, POPULAR[0].lon),
      { timeout: 6000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCity(lat: number, lon: number) {
    setLoading(true); setErr(null);
    try {
      const b = await weatherApi.bundle(lat, lon);
      setBundle(b);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load weather");
    } finally { setLoading(false); }
  }

  return (
    <PageLayout
      title="Real-time Weather, AQI & Smart Insights"
      description="Get real-time weather, 7-day forecast, air quality, and AI-powered lifestyle suggestions for any city worldwide."
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "SmartWeather Pro",
        url: typeof window !== "undefined" ? window.location.origin : "",
      }}
    >
      <section className="container pt-10 md:pt-16 pb-8">
        <div className="max-w-3xl mx-auto text-center animate-fade-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass">
            <Sparkles className="h-3 w-3 text-accent" /> AI-powered lifestyle insights
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold mt-5 leading-tight">
            Weather that tells you <span className="bg-gradient-sky bg-clip-text text-transparent">what to do next</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Real-time conditions, 7-day forecast, air quality, and smart suggestions for any city worldwide.
          </p>
          <div className="mt-8">
            <CitySearch large autoFocus />
          </div>
        </div>
      </section>

      <section className="container">
        <AdSlot variant="banner" className="mb-6" />
      </section>

      <section className="container grid gap-6 lg:grid-cols-[1fr_300px] items-start">
        <div>
          {loading && !bundle && <WeatherSkeleton />}
          {err && (
            <div className="glass rounded-2xl p-6 text-destructive">
              <p className="font-semibold">Could not load weather</p>
              <p className="text-sm mt-1">{err}</p>
            </div>
          )}
          {bundle && <WeatherView bundle={bundle} />}

          <AdSlot variant="in-content" className="mt-6" />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <div className="glass rounded-2xl p-5">
            <h2 className="font-display font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> Popular cities</h2>
            <ul className="mt-3 space-y-1">
              {POPULAR.map((c) => (
                <li key={c.name}>
                  <button
                    onClick={() => loadCity(c.lat, c.lon)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary/60 flex justify-between"
                  >
                    <span>{c.name}</span>
                    <span className="text-muted-foreground text-xs">{c.country}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {favorites.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h2 className="font-display font-semibold flex items-center gap-2"><Activity className="h-4 w-4" /> Your favorites</h2>
              <ul className="mt-3 space-y-1">
                {favorites.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to={`/weather/${c.slug}?lat=${c.lat}&lon=${c.lon}`}
                      className="block px-3 py-2 rounded-lg text-sm hover:bg-secondary/60"
                    >
                      {c.name} <span className="text-muted-foreground text-xs">{c.country}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <AdSlot variant="sidebar" />
        </aside>
      </section>
    </PageLayout>
  );
};

export default Index;
