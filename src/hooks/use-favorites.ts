import { useCallback, useEffect, useState } from "react";

const KEY = "swp-favorites";

export interface FavoriteCity {
  slug: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

function read(): FavoriteCity[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  useEffect(() => { setFavorites(read()); }, []);

  const persist = (next: FavoriteCity[]) => {
    setFavorites(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const add = useCallback((c: FavoriteCity) => {
    const cur = read();
    if (cur.find((x) => x.slug === c.slug)) return;
    persist([c, ...cur].slice(0, 12));
  }, []);

  const remove = useCallback((slug: string) => {
    persist(read().filter((c) => c.slug !== slug));
  }, []);

  const has = useCallback((slug: string) => favorites.some((c) => c.slug === slug), [favorites]);

  return { favorites, add, remove, has };
}
