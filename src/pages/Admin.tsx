import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blog-admin`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

interface Post {
  id: string; slug: string; title: string; excerpt: string | null;
  content: string; cover_image: string | null; published: boolean; created_at: string;
}

async function api(action: string, passcode: string, body?: unknown) {
  const r = await fetch(`${FN_URL}?action=${action}`, {
    method: body ? "POST" : "GET",
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      "x-admin-passcode": passcode,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? "Request failed");
  return j;
}

const Admin = () => {
  const [passcode, setPasscode] = useState(() => sessionStorage.getItem("swp-admin") ?? "");
  const [authed, setAuthed] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Partial<Post> | null>(null);

  async function load(code = passcode) {
    try {
      const { posts } = await api("list", code);
      setPosts(posts);
      setAuthed(true);
      sessionStorage.setItem("swp-admin", code);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Auth failed");
      setAuthed(false);
    }
  }

  useEffect(() => { if (passcode) load(passcode); /* eslint-disable-next-line */ }, []);

  async function save() {
    if (!editing) return;
    try {
      if (editing.id) {
        await api("update", passcode, editing);
        toast.success("Updated");
      } else {
        await api("create", passcode, editing);
        toast.success("Created");
      }
      setEditing(null);
      load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  async function del(id: string) {
    if (!confirm("Delete this post?")) return;
    try { await api("delete", passcode, { id }); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  if (!authed) {
    return (
      <PageLayout title="Admin">
        <section className="container py-20 max-w-md">
          <h1 className="font-display text-3xl font-bold">Admin login</h1>
          <p className="text-muted-foreground mt-2 text-sm">Enter the BLOG_ADMIN_PASSCODE.</p>
          <form onSubmit={(e) => { e.preventDefault(); load(passcode); }} className="mt-6 space-y-3">
            <Input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Passcode" />
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Admin — Blog">
      <section className="container py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Blog admin</h1>
          <Button onClick={() => setEditing({ title: "", content: "", excerpt: "", slug: "", published: true })}>
            New post
          </Button>
        </div>

        {editing && (
          <div className="glass-strong rounded-2xl p-6 mt-6 space-y-3">
            <Input
              placeholder="Title"
              value={editing.title ?? ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
            <Input
              placeholder="Slug (optional, auto-generated)"
              value={editing.slug ?? ""}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
            />
            <Input
              placeholder="Cover image URL (optional)"
              value={editing.cover_image ?? ""}
              onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })}
            />
            <Textarea
              placeholder="Excerpt"
              rows={2}
              value={editing.excerpt ?? ""}
              onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
            />
            <Textarea
              placeholder="Content (Markdown)"
              rows={14}
              value={editing.content ?? ""}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              className="font-mono text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.published ?? true}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
              /> Published
            </label>
            <div className="flex gap-2">
              <Button onClick={save}>Save</Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground">/{p.slug} • {p.published ? "published" : "draft"}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => del(p.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
};

export default Admin;
