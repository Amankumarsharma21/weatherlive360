import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { useFavorites } from "@/hooks/use-favorites";
import { Heart, Trash2 } from "lucide-react";

const FavoritesPage = () => {
  const { favorites, remove } = useFavorites();
  return (
    <PageLayout title="Favorite cities" description="Your saved cities for quick weather access.">
      <section className="container py-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-2">
          <Heart className="h-7 w-7 text-destructive" /> Favorite cities
        </h1>
        {favorites.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            You haven't added any favorites yet. Open a city and tap the heart to save it.
          </p>
        ) : (
          <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((c) => (
              <li key={c.slug} className="glass rounded-2xl p-4 flex items-center justify-between">
                <Link to={`/weather/${c.slug}?lat=${c.lat}&lon=${c.lon}`} className="flex-1">
                  <div className="font-display font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.country}</div>
                </Link>
                <button onClick={() => remove(c.slug)} aria-label="Remove" className="p-2 rounded-lg hover:bg-secondary/60">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageLayout>
  );
};

export default FavoritesPage;
