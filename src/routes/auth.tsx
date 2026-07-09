import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — AI Creative Assistant" },
      { name: "description", content: "Sign in to AI Creative Assistant with your Google account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function signInGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) {
        toast.error("Sign in failed", { description: String(result.error?.message ?? result.error) });
        setLoading(false);
        return;
      }
      if (!result.redirected) {
        navigate({ to: "/dashboard" });
      }
    } catch (e) {
      toast.error("Sign in error", { description: (e as Error).message });
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-hero bg-background flex items-center justify-center px-4">
      <div className="glass rounded-2xl p-10 max-w-md w-full shadow-glow">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold">AI Creative Assistant</div>
            <div className="text-xs text-muted-foreground">Create with intelligence</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome <span className="text-gradient-brand">back</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Sign in to generate images and talk with AI using your voice.
        </p>

        <Button
          onClick={signInGoogle}
          disabled={loading}
          className="w-full h-12 bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm"
        >
          <GoogleIcon />
          <span className="ml-2 font-medium">{loading ? "Signing in..." : "Continue with Google"}</span>
        </Button>

        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Wand2 className="w-3.5 h-3.5" />
          <span>Powered by AI Gateway • Secure Google OAuth</span>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
