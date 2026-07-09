import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ImageIcon, Mic, Sparkles, TrendingUp, Clock, History as HistoryIcon, ArrowRight, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — AI Creative Assistant" }, { name: "description", content: "Your AI workspace overview." }],
  }),
  component: Dashboard,
});

type Recent = { id: string; kind: "image" | "voice"; label: string; date: string };

function Dashboard() {
  const [name, setName] = useState("Creator");
  const [images, setImages] = useState(0);
  const [voices, setVoices] = useState(0);
  const [recent, setRecent] = useState<Recent[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const meta = (u.user?.user_metadata ?? {}) as { full_name?: string; name?: string };
      const first = (meta.full_name ?? meta.name ?? u.user?.email?.split("@")[0] ?? "Creator").split(" ")[0];
      setName(first);

      const [{ count: i }, { count: v }, { data: imgs }, { data: vs }] = await Promise.all([
        supabase.from("image_generations").select("*", { count: "exact", head: true }),
        supabase.from("voice_history").select("*", { count: "exact", head: true }),
        supabase.from("image_generations").select("id,prompt,created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("voice_history").select("id,voice_text,created_at").order("created_at", { ascending: false }).limit(3),
      ]);
      setImages(i ?? 0);
      setVoices(v ?? 0);
      const merged: Recent[] = [
        ...(imgs ?? []).map((r) => ({ id: r.id, kind: "image" as const, label: r.prompt, date: r.created_at })),
        ...(vs ?? []).map((r) => ({ id: r.id, kind: "voice" as const, label: r.voice_text, date: r.created_at })),
      ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
      setRecent(merged);
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 md:p-12 shadow-glow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)] opacity-20" />
        <div className="absolute -bottom-16 -right-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" /> AI Creative Workspace
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-white tracking-tight">
            Welcome back, {name} 👋
          </h1>
          <p className="mt-3 text-white/80 text-lg max-w-xl">
            Ready to create something amazing today? Choose a tool below to get started.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/image-studio">
              <Button className="bg-white text-slate-900 hover:bg-white/90 h-11">
                <Wand2 className="w-4 h-4 mr-2" /> Create Image
              </Button>
            </Link>
            <Link to="/voice-assistant">
              <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white h-11">
                <Mic className="w-4 h-4 mr-2" /> Voice To Image
              </Button>
            </Link>
            <Link to="/history">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white h-11">
                <HistoryIcon className="w-4 h-4 mr-2" /> View History
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-5 md:grid-cols-3">
        <StatCard label="Total Images" value={images} icon={<ImageIcon className="w-4 h-4" />} />
        <StatCard label="Total Voice Requests" value={voices} icon={<Mic className="w-4 h-4" />} />
        <StatCard label="Recent Activity" value={images + voices} icon={<TrendingUp className="w-4 h-4" />} suffix="creations" />
      </section>

      {/* Tool cards */}
      <section className="grid gap-5 md:grid-cols-2">
        <FeatureCard
          to="/image-studio"
          icon={<ImageIcon className="w-5 h-5" />}
          title="Image Generation"
          desc="Turn your ideas into beautiful images from text prompts."
        />
        <FeatureCard
          to="/voice-assistant"
          icon={<Mic className="w-5 h-5" />}
          title="Voice → Image"
          desc="Speak your idea, edit the prompt, and generate art instantly."
        />
      </section>

      {/* Recent */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <Card className="p-2 divide-y">
          {recent.length === 0 && (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto bg-gradient-brand-soft flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="text-sm font-medium">No activity yet</div>
              <p className="text-xs text-muted-foreground mt-1">Generate your first image to see it here.</p>
              <Link to="/image-studio" className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-gradient-brand">
                Start creating <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
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
