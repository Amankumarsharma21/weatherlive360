import { Wind, Droplets, Eye, Gauge, Sunrise, Sunset, Thermometer, Heart } from "lucide-react";
import type { WeatherBundle } from "@/lib/weather-api";
import { aggregateDailyForecast, aqiLabel, generateInsights } from "@/lib/insights";
import { formatDay, formatTime, owmIconUrl, citySlug } from "@/lib/format";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AQI_COLORS = ["", "bg-emerald-500", "bg-lime-500", "bg-amber-500", "bg-orange-500", "bg-red-500"];
const TONE = {
  positive: "border-emerald-400/40 bg-emerald-500/10",
  warning: "border-amber-400/40 bg-amber-500/10",
  info: "border-sky-400/40 bg-sky-500/10",
};

export function WeatherView({ bundle }: { bundle: WeatherBundle }) {
  const { current, forecast, air, units } = bundle;
  const tz = current.timezone;
  const unit = units === "metric" ? "°C" : "°F";
  const windUnit = units === "metric" ? "m/s" : "mph";
  const insights = generateInsights(current, forecast.list, air);
  const daily = aggregateDailyForecast(forecast.list);
  const hourly = forecast.list.slice(0, 8);
  const aqi = air.list[0]?.main.aqi ?? 1;

  const fav = useFavorites();
  const slug = citySlug(current.name, current.sys.country);
  const isFav = fav.has(slug);

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <section className="glass-strong rounded-3xl p-6 md:p-10 animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{current.sys.country}</span>
              <span>•</span>
              <span>Local time {formatTime(current.dt, tz)}</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mt-2 flex items-center gap-3">
              {current.name}
              <Button
                variant="ghost" size="icon"
                aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                onClick={() =>
                  isFav
                    ? fav.remove(slug)
                    : fav.add({ slug, name: current.name, country: current.sys.country, lat: current.coord.lat, lon: current.coord.lon })
                }
              >
                <Heart className={cn("h-5 w-5", isFav && "fill-destructive text-destructive")} />
              </Button>
            </h1>
            <p className="capitalize text-lg text-muted-foreground mt-1">
              {current.weather[0]?.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <img src={owmIconUrl(current.weather[0]?.icon ?? "01d")} alt="" width={96} height={96} className="drop-shadow-lg" />
            <div>
              <div className="font-display text-6xl md:text-7xl font-bold leading-none">
                {Math.round(current.main.temp)}<span className="text-3xl align-top">{unit}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5" /> Feels like {Math.round(current.main.feels_like)}{unit}
              </div>
            </div>
          </div>
        </div>

        {/* Stat grid */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Stat icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${current.main.humidity}%`} />
          <Stat icon={<Wind className="h-4 w-4" />} label="Wind" value={`${current.wind.speed.toFixed(1)} ${windUnit}`} />
          <Stat icon={<Eye className="h-4 w-4" />} label="Visibility" value={`${(current.visibility / 1000).toFixed(1)} km`} />
          <Stat icon={<Gauge className="h-4 w-4" />} label="Pressure" value={`${current.main.pressure} hPa`} />
          <Stat icon={<Sunrise className="h-4 w-4" />} label="Sunrise" value={formatTime(current.sys.sunrise, tz)} />
          <Stat icon={<Sunset className="h-4 w-4" />} label="Sunset" value={formatTime(current.sys.sunset, tz)} />
        </div>
      </section>

      {/* Smart insights */}
      <section className="grid gap-4 md:grid-cols-2">
        {insights.map((i, idx) => (
          <article key={idx} className={cn("rounded-2xl p-5 border", TONE[i.tone])}>
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>{i.icon}</span>
              <div>
                <h3 className="font-display font-semibold">{i.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{i.body}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Hourly */}
      <section className="glass rounded-2xl p-5">
        <h2 className="font-display text-xl font-semibold mb-4">Next 24 hours</h2>
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="flex gap-3 min-w-max">
            {hourly.map((h) => (
              <div key={h.dt} className="flex flex-col items-center w-20 p-3 rounded-xl bg-secondary/40">
                <span className="text-xs text-muted-foreground">{formatTime(h.dt, tz)}</span>
                <img src={owmIconUrl(h.weather[0]?.icon ?? "01d")} alt="" width={48} height={48} loading="lazy" />
                <span className="font-semibold">{Math.round(h.main.temp)}{unit}</span>
                <span className="text-xs text-muted-foreground">{Math.round((h.pop ?? 0) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7-day */}
      <section className="glass rounded-2xl p-5">
        <h2 className="font-display text-xl font-semibold mb-4">7-day forecast</h2>
        <div className="divide-y divide-border/60">
          {daily.map((d) => (
            <div key={d.date} className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1.2fr_2fr_auto] items-center gap-4 py-3">
              <span className="font-medium">{formatDay(d.date)}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
                <img src={owmIconUrl(d.weather?.icon ?? "01d")} alt="" width={36} height={36} loading="lazy" />
                <span>{d.weather?.description}</span>
                <span className="ml-2 hidden md:inline">💧 {Math.round((d.pop ?? 0) * 100)}%</span>
              </div>
              <span className="font-mono tabular-nums text-right">
                <span className="text-muted-foreground">{Math.round(d.min)}°</span>
                <span className="mx-1">/</span>
                <span className="font-semibold">{Math.round(d.max)}°</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AQI + map */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-xl font-semibold mb-4">Air Quality</h2>
          <div className="flex items-center gap-4">
            <div className={cn("h-16 w-16 rounded-2xl grid place-items-center font-display text-2xl font-bold text-white", AQI_COLORS[aqi])}>
              {aqi}
            </div>
            <div>
              <p className="font-semibold">{aqiLabel(aqi)}</p>
              <p className="text-sm text-muted-foreground">
                PM2.5 {air.list[0]?.components.pm2_5?.toFixed(1)} • PM10 {air.list[0]?.components.pm10?.toFixed(1)} • O₃ {air.list[0]?.components.o3?.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-xl font-semibold mb-4">Weather map</h2>
          <div className="aspect-video rounded-xl overflow-hidden border border-border">
            <iframe
              title={`Map of ${current.name}`}
              loading="lazy"
              className="w-full h-full"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${current.coord.lon - 0.3}%2C${current.coord.lat - 0.2}%2C${current.coord.lon + 0.3}%2C${current.coord.lat + 0.2}&layer=mapnik&marker=${current.coord.lat}%2C${current.coord.lon}`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="font-display font-semibold mt-1">{value}</div>
    </div>
  );
}
