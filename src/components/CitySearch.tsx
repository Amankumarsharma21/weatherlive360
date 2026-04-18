import { useEffect, useRef, useState } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { weatherApi, type GeoResult } from "@/lib/weather-api";
import { useNavigate } from "react-router-dom";
import { citySlug } from "@/lib/format";

export function CitySearch({ autoFocus, large }: { autoFocus?: boolean; large?: boolean }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await weatherApi.geocode(q.trim());
        setResults(data);
        setOpen(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goto = (c: GeoResult) => {
    const slug = citySlug(c.name, c.country);
    navigate(`/weather/${slug}?lat=${c.lat}&lon=${c.lon}`);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await weatherApi.reverse(pos.coords.latitude, pos.coords.longitude);
          if (data[0]) goto(data[0]);
        } finally { setLoading(false); }
      },
      () => setLoading(false),
      { timeout: 8000 },
    );
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className={`glass-strong rounded-2xl flex items-center gap-2 ${large ? "p-2" : "p-1.5"}`}>
        <Search className={`${large ? "h-5 w-5 ml-3" : "h-4 w-4 ml-2"} text-muted-foreground`} />
        <input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search any city worldwide..."
          className={`flex-1 bg-transparent outline-none ${large ? "h-12 text-lg" : "h-9"}`}
          aria-label="Search city"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <button
          type="button"
          onClick={useMyLocation}
          className="rounded-xl px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5"
        >
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">My location</span>
        </button>
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full glass-strong rounded-2xl overflow-hidden">
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lon}-${i}`}>
              <button
                onClick={() => { setOpen(false); goto(r); }}
                className="w-full text-left px-4 py-3 hover:bg-secondary/60 transition-colors"
              >
                <div className="font-medium">{r.name}{r.state ? `, ${r.state}` : ""}</div>
                <div className="text-xs text-muted-foreground">{r.country} • {r.lat.toFixed(2)}, {r.lon.toFixed(2)}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
