import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ImageIcon, Mic, Sparkles, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — AI Creative Assistant" }, { name: "description", content: "Your AI workspace overview." }],
  }),
  component: Dashboard,
});

type Recent = { id: string; kind: "image" | "voice"; label: string; date: string };

function Dashboard() {
  const [images, setImages] = useState(0);
  const [voices, setVoices] = useState(0);
  const [recent, setRecent] = useState<Recent[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: i }, { count: v }, { data: imgs }, { data: vs }] = await Promise.all([
        supabase.from("image_generations").select("*", { count: "exact", head: true }),
        supabase.from("voice_sessions").select("*", { count: "exact", head: true }),
        supabase.from("image_generations").select("id,prompt,created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("voice_sessions").select("id,question,created_at").order("created_at", { ascending: false }).limit(3),
      ]);
      setImages(i ?? 0);
      setVoices(v ?? 0);
      const merged: Recent[] = [
        ...(imgs ?? []).map((r) => ({ id: r.id, kind: "image" as const, label: r.prompt, date: r.created_at })),
        ...(vs ?? []).map((r) => ({ id: r.id, kind: "voice" as const, label: r.question, date: r.created_at })),
      ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
      setRecent(merged);
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 md:p-12 shadow-glow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)] opacity-20" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" /> Powered by AI Gateway
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-white tracking-tight">Create With AI</h1>
          <p className="mt-3 text-white/80 text-lg max-w-xl">
            Generate images and interact with AI using voice.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <FeatureCard
          to="/image-studio"
          icon={<ImageIcon className="w-5 h-5" />}
          title="Image Generation"
          desc="Create images from text prompts."
        />
        <FeatureCard
          to="/voice-assistant"
          icon={<Mic className="w-5 h-5" />}
          title="Voice Assistant"
          desc="Talk with AI naturally."
        />
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <StatCard label="Total Images Created" value={images} icon={<ImageIcon className="w-4 h-4" />} />
        <StatCard label="Total Voice Sessions" value={voices} icon={<Mic className="w-4 h-4" />} />
        <StatCard label="Activity" value={images + voices} icon={<TrendingUp className="w-4 h-4" />} suffix="total" />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <Card className="p-2 divide-y">
          {recent.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground text-center">No activity yet. Try generating your first image!</div>
          )}
          {recent.map((r) => (
            <div key={r.id} className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand-soft flex items-center justify-center">
                {r.kind === "image" ? <ImageIcon className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.label}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.date).toLocaleString()}</div>
              </div>
              <span className="text-xs text-muted-foreground capitalize">{r.kind}</span>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}

function FeatureCard({ to, icon, title, desc }: { to: "/image-studio" | "/voice-assistant"; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to} className="group">
      <Card className="p-6 transition-all hover:shadow-glow hover:-translate-y-0.5 border-transparent bg-card">
        <div className="w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-glow mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
        <div className="mt-4 text-sm font-medium text-gradient-brand group-hover:underline">Open →</div>
      </Card>
    </Link>
  );
}

function StatCard({ label, value, icon, suffix }: { label: string; value: number; icon: React.ReactNode; suffix?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-muted-foreground text-xs">
        <span>{label}</span>
        <span className="w-7 h-7 rounded-md bg-gradient-brand-soft flex items-center justify-center">{icon}</span>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight">
        {value}
        {suffix && <span className="text-sm font-normal text-muted-foreground ml-2">{suffix}</span>}
      </div>
    </Card>
  );
}
