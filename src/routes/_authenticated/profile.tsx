import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, ImageIcon, Mic, Calendar } from "lucide-react";
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
        supabase.from("voice_sessions").select("*", { count: "exact", head: true }),
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
    <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

      <Card className="p-8">
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-brand text-white text-xl">
              {user.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Images created" value={images} icon={<ImageIcon className="w-4 h-4" />} />
        <StatCard label="Voice sessions" value={voices} icon={<Mic className="w-4 h-4" />} />
        <StatCard label="Joined" value={new Date(user.joined).toLocaleDateString()} icon={<Calendar className="w-4 h-4" />} />
      </div>

      <Card className="p-6">
        <Button variant="outline" onClick={signOut} className="w-full sm:w-auto">
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
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
