import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { CitySearch } from "@/components/CitySearch";
import { weatherApi, type GeoResult } from "@/lib/weather-api";
import { citySlug } from "@/lib/format";
import { Loader2 } from "lucide-react";

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    weatherApi.geocode(q).then(setResults).finally(() => setLoading(false));
  }, [q]);

  return (
    <PageLayout title={`Search: ${q}`} description={`Search results for ${q}`}>
      <section className="container py-10">
        <CitySearch />
        <h1 className="font-display text-2xl font-bold mt-8">Results for "{q}"</h1>
        {loading && <Loader2 className="h-6 w-6 animate-spin mt-4" />}
        {!loading && results.length === 0 && <p className="text-muted-foreground mt-4">No cities found.</p>}
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          {results.map((r, i) => (
            <li key={i}>
              <Link
                to={`/weather/${citySlug(r.name, r.country)}?lat=${r.lat}&lon=${r.lon}`}
                className="glass rounded-xl p-4 block hover:shadow-elevated transition-shadow"
              >
                <div className="font-semibold">{r.name}{r.state ? `, ${r.state}` : ""}</div>
                <div className="text-sm text-muted-foreground">{r.country}</div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageLayout>
  );
};

export default SearchPage;
