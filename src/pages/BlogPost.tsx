import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { PageLayout } from "@/components/PageLayout";
import { AdSlot } from "@/components/AdSlot";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string; slug: string; title: string; excerpt: string | null;
  content: string; cover_image: string | null; created_at: string;
}

const BlogPost = () => {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase.from("posts").select("*").eq("slug", slug).eq("published", true).maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else setPost(data as Post);
      });
  }, [slug]);

  if (notFound) {
    return (
      <PageLayout title="Post not found">
        <section className="container py-20 text-center">
          <h1 className="font-display text-4xl font-bold">Post not found</h1>
          <Link to="/blog" className="text-primary mt-4 inline-block">← Back to blog</Link>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={post?.title}
      description={post?.excerpt ?? undefined}
      jsonLd={post ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        datePublished: post.created_at,
        description: post.excerpt,
      } : undefined}
    >
      <article className="container py-10 max-w-3xl">
        {post ? (
          <>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">← All posts</Link>
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-4">{post.title}</h1>
            <p className="text-sm text-muted-foreground mt-2">{new Date(post.created_at).toLocaleDateString()}</p>
            {post.cover_image && <img src={post.cover_image} alt="" className="rounded-2xl mt-6 w-full" />}
            <AdSlot variant="in-content" className="my-8" />
            <div className="prose prose-neutral dark:prose-invert max-w-none mt-6
              prose-headings:font-display prose-headings:tracking-tight
              prose-a:text-primary">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
            <AdSlot variant="banner" className="mt-10" />
          </>
        ) : (
          <div className="space-y-4">
            <div className="h-10 w-2/3 shimmer rounded-lg" />
            <div className="h-4 w-32 shimmer rounded" />
            <div className="h-64 shimmer rounded-2xl" />
          </div>
        )}
      </article>
    </PageLayout>
  );
};

export default BlogPost;
