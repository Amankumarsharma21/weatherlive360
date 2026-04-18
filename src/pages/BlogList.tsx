import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { AdSlot } from "@/components/AdSlot";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string; slug: string; title: string; excerpt: string | null;
  cover_image: string | null; created_at: string;
}

const BlogList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("posts")
      .select("id,slug,title,excerpt,cover_image,created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setPosts(data ?? []); setLoading(false); });
  }, []);

  return (
    <PageLayout
      title="Weather Blog — Guides, Travel & Tips"
      description="Weather guides, best times to visit cities, AQI explainers and more from SmartWeather Pro."
    >
      <section className="container py-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Weather Blog</h1>
        <p className="text-muted-foreground mt-2">Travel guides, seasonal tips, and weather science.</p>

        <AdSlot variant="banner" className="mt-6" />

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 rounded-2xl shimmer" />)}
          </div>
        ) : posts.length === 0 ? (
          <p className="mt-8 text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                to={`/blog/${p.slug}`}
                className="glass rounded-2xl p-5 hover:shadow-elevated transition-shadow flex flex-col"
              >
                {p.cover_image && (
                  <img src={p.cover_image} alt="" loading="lazy" className="rounded-xl mb-3 aspect-video object-cover" />
                )}
                <h2 className="font-display font-semibold text-lg">{p.title}</h2>
                {p.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>}
                <span className="text-xs text-muted-foreground mt-auto pt-3">
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageLayout>
  );
};

export default BlogList;
