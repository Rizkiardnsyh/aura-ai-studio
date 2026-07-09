import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, ImageIcon, Mic, Calendar, Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — AI Creative Assistant" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<{ email: string; name: string; avatar?: string; joined: string } | null>(null);
  const [images, setImages] = useState(0);
  const [voices, setVoices] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) return;
      const meta = u.user_metadata as { full_name?: string; name?: string; avatar_url?: string };
      setUser({
        email: u.email ?? "",
        name: meta.full_name ?? meta.name ?? u.email?.split("@")[0] ?? "User",
        avatar: meta.avatar_url,
        joined: u.created_at,
      });
      const [{ count: i }, { count: v }] = await Promise.all([
        supabase.from("image_generations").select("*", { count: "exact", head: true }),
        supabase.from("voice_history").select("*", { count: "exact", head: true }),
      ]);
      setImages(i ?? 0);
      setVoices(v ?? 0);
    })();
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  if (!user) return <div className="p-10 text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

      {/* Hero profile card */}
      <Card className="relative overflow-hidden p-0">
        <div className="h-32 bg-gradient-brand relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)] opacity-20" />
        </div>
        <div className="px-8 pb-8 -mt-12 flex flex-col sm:flex-row sm:items-end gap-5">
          <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-brand text-white text-2xl">
              {user.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 sm:pb-2">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Calendar className="w-3 h-3" /> Joined {new Date(user.joined).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand-soft px-3 py-1 text-xs font-medium text-primary self-start sm:self-end sm:pb-2">
            <Sparkles className="w-3 h-3" /> AI Creator
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total images created" value={images} icon={<ImageIcon className="w-4 h-4" />} />
        <StatCard label="Total voice commands" value={voices} icon={<Mic className="w-4 h-4" />} />
        <StatCard
          label="Account created"
          value={new Date(user.joined).toLocaleDateString()}
          icon={<Calendar className="w-4 h-4" />}
        />
      </div>

      {/* Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-medium">Account</div>
            <p className="text-sm text-muted-foreground">Sign out of your AI Creative Assistant workspace.</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="w-7 h-7 rounded-md bg-gradient-brand-soft flex items-center justify-center">{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
    </Card>
  );
}
