import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, ImageIcon, Mic, FolderHeart, Wand2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import heroArt from "@/assets/auth-hero.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — AI Creative Assistant" },
      { name: "description", content: "Sign in to AI Creative Assistant. Generate stunning AI images from text and use your voice to create." },
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
      if (!result.redirected) navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error("Sign in error", { description: (e as Error).message });
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07071a] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#5b47ff] opacity-30 blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-[#c026d3] opacity-25 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-[#3b82f6] opacity-20 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-6 md:py-10">
        {/* Nav */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(139,92,246,0.7)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold tracking-tight">AI Creative Assistant</div>
              <div className="text-[11px] text-white/50">Create with intelligence</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-white/60">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            All systems online
          </div>
        </header>

        <main className="mt-10 md:mt-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: pitch + login */}
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
              <Wand2 className="w-3.5 h-3.5 text-fuchsia-300" /> Powered by Gemini · Whisper · TTS
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Create Anything With The{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                Power of AI
              </span>
            </h1>
            <p className="mt-5 text-lg text-white/70 max-w-lg">
              Generate images from text and interact with AI using your voice. One workspace for every creative idea.
            </p>

            {/* Login card */}
            <div className="mt-8 max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(88,28,135,0.6)]">
              <div className="text-sm font-medium text-white/90">Get started in seconds</div>
              <p className="text-xs text-white/50 mt-1">Sign in with Google — no credit card needed.</p>
              <Button
                onClick={signInGoogle}
                disabled={loading}
                className="mt-5 w-full h-12 bg-white text-slate-800 hover:bg-white/90"
              >
                <GoogleIcon />
                <span className="ml-2 font-medium">{loading ? "Signing in..." : "Continue with Google"}</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <div className="mt-4 text-[11px] text-white/40 text-center">
                By continuing you agree to our terms of service and privacy policy.
              </div>
            </div>

            {/* Feature preview cards */}
            <div className="mt-10 grid sm:grid-cols-3 gap-3">
              <FeaturePreview
                icon={<ImageIcon className="w-4 h-4" />}
                title="Image Generation"
                desc="Turn your ideas into beautiful images."
              />
              <FeaturePreview
                icon={<Mic className="w-4 h-4" />}
                title="Voice Assistant"
                desc="Speak naturally and convert your voice into AI commands."
              />
              <FeaturePreview
                icon={<FolderHeart className="w-4 h-4" />}
                title="Personal Workspace"
                desc="Save your creations and manage your history."
              />
            </div>
          </div>

          {/* Right: hero art + preview mockups */}
          <div className="relative animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_40px_120px_-30px_rgba(88,28,135,0.7)]">
              <img
                src={heroArt}
                alt="AI creative assistant illustration"
                width={1024}
                height={1280}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07071a] via-[#07071a]/20 to-transparent" />

              {/* Floating preview: image */}
              <div className="absolute top-6 left-6 max-w-[52%] rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-1000">
                <div className="rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-indigo-500/60 via-fuchsia-500/50 to-pink-400/60 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.5),transparent_50%)]" />
                </div>
                <div className="px-2 pt-2 pb-1">
                  <div className="text-[10px] uppercase tracking-wider text-white/60">Generated</div>
                  <div className="text-xs text-white/90 truncate">"Neon skyline over Tokyo, cinematic"</div>
                </div>
              </div>

              {/* Floating preview: voice */}
              <div className="absolute bottom-24 right-6 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl shadow-2xl w-56 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-500 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] uppercase text-white/60 tracking-wider">Listening</div>
                    <div className="flex items-end gap-0.5 h-4 mt-1">
                      {[6, 12, 8, 16, 10, 14, 7, 12, 9].map((h, i) => (
                        <span
                          key={i}
                          className="w-0.5 rounded-full bg-white/80 animate-pulse"
                          style={{ height: h, animationDelay: `${i * 80}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating preview: history */}
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                <div className="text-[10px] uppercase text-white/60 tracking-wider mb-2">Recent history</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {["from-blue-400 to-indigo-500", "from-fuchsia-400 to-purple-500", "from-amber-300 to-rose-400", "from-emerald-300 to-cyan-500"].map((g, i) => (
                    <div key={i} className={`aspect-square rounded-md bg-gradient-to-br ${g}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-16 text-center text-xs text-white/40">
          © {new Date().getFullYear()} AI Creative Assistant · Secure Google OAuth
        </footer>
      </div>
    </div>
  );
}

function FeaturePreview({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur transition-all hover:bg-white/[0.06] hover:border-white/20">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-sm font-medium text-white">{title}</div>
      <div className="text-xs text-white/60 mt-1 leading-relaxed">{desc}</div>
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
