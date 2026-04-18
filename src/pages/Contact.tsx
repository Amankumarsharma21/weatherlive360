import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(5).max(2000),
});

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) { toast.error("Please check your inputs."); return; }
    // Open mail client as a no-backend fallback
    const subject = encodeURIComponent(`Contact from ${r.data.name}`);
    const body = encodeURIComponent(`${r.data.message}\n\n— ${r.data.name} <${r.data.email}>`);
    window.location.href = `mailto:hello@smartweather.example?subject=${subject}&body=${body}`;
    toast.success("Opening your email client...");
  }

  return (
    <PageLayout title="Contact" description="Get in touch with the SmartWeather Pro team.">
      <section className="container py-12 max-w-xl">
        <h1 className="font-display text-4xl font-bold">Contact us</h1>
        <p className="text-muted-foreground mt-2">Have feedback or a feature request? Send us a note.</p>
        <form onSubmit={submit} className="glass-strong rounded-2xl p-6 mt-6 space-y-4">
          <Input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Textarea placeholder="Message" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <Button type="submit" className="w-full">Send message</Button>
        </form>
      </section>
    </PageLayout>
  );
};
export default Contact;
