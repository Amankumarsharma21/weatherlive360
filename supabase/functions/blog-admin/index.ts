// SmartWeather Pro — blog admin (passcode-gated CRUD)
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const PASSCODE = Deno.env.get("BLOG_ADMIN_PASSCODE");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!PASSCODE) return json({ error: "BLOG_ADMIN_PASSCODE not configured" }, 500);

  const passcode = req.headers.get("x-admin-passcode");
  if (passcode !== PASSCODE) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "list";

  try {
    if (action === "list") {
      const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return json({ posts: data });
    }
    if (action === "create" && req.method === "POST") {
      const body = await req.json();
      const title = String(body.title ?? "").trim();
      const content = String(body.content ?? "").trim();
      if (!title || !content) return json({ error: "title and content required" }, 400);
      const slug = body.slug ? slugify(String(body.slug)) : slugify(title);
      const { data, error } = await supabase.from("posts").insert({
        slug, title,
        excerpt: body.excerpt ?? null,
        content,
        cover_image: body.cover_image ?? null,
        published: body.published ?? true,
      }).select().single();
      if (error) throw error;
      return json({ post: data });
    }
    if (action === "update" && req.method === "POST") {
      const body = await req.json();
      const id = String(body.id ?? "");
      if (!id) return json({ error: "id required" }, 400);
      const patch: Record<string, unknown> = {};
      for (const k of ["title", "excerpt", "content", "cover_image", "published", "slug"]) {
        if (k in body) patch[k] = k === "slug" ? slugify(String(body[k])) : body[k];
      }
      const { data, error } = await supabase.from("posts").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return json({ post: data });
    }
    if (action === "delete" && req.method === "POST") {
      const body = await req.json();
      const id = String(body.id ?? "");
      if (!id) return json({ error: "id required" }, 400);
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      return json({ ok: true });
    }
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("blog-admin error", e);
    return json({ error: "An internal error occurred. Please try again." }, 500);
  }
});
