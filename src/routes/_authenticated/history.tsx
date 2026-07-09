import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Trash2, ImageIcon, Mic, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — AI Creative Assistant" }] }),
  component: HistoryPage,
});

type Img = { id: string; prompt: string; style: string | null; image_url: string; created_at: string };
type Voice = { id: string; question: string; answer: string; created_at: string };

function HistoryPage() {
  const [imgs, setImgs] = useState<Img[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [view, setView] = useState<Img | null>(null);

  const load = useCallback(async () => {
    const [{ data: i }, { data: v }] = await Promise.all([
      supabase.from("image_generations").select("*").order("created_at", { ascending: false }),
      supabase.from("voice_sessions").select("*").order("created_at", { ascending: false }),
    ]);
    setImgs((i ?? []) as Img[]);
    setVoices((v ?? []) as Voice[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function delImg(id: string) {
    const { error } = await supabase.from("image_generations").delete().eq("id", id);
    if (error) return toast.error("Delete failed");
    setImgs((s) => s.filter((r) => r.id !== id));
    toast.success("Deleted");
  }
  async function delVoice(id: string) {
    const { error } = await supabase.from("voice_sessions").delete().eq("id", id);
    if (error) return toast.error("Delete failed");
    setVoices((s) => s.filter((r) => r.id !== id));
    toast.success("Deleted");
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">History</h1>

      <Tabs defaultValue="images">
        <TabsList>
          <TabsTrigger value="images"><ImageIcon className="w-4 h-4 mr-2" />Images ({imgs.length})</TabsTrigger>
          <TabsTrigger value="voice"><Mic className="w-4 h-4 mr-2" />Voice ({voices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="mt-6">
          {imgs.length === 0 ? (
            <EmptyState label="No images yet" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imgs.map((r) => (
                <Card key={r.id} className="overflow-hidden group">
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img src={r.image_url} alt={r.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="text-sm font-medium line-clamp-2">{r.prompt}</div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{r.style ?? "—"}</span>
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setView(r)}>
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => delImg(r.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="voice" className="mt-6">
          {voices.length === 0 ? (
            <EmptyState label="No voice sessions yet" />
          ) : (
            <div className="space-y-3">
              {voices.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">You asked</div>
                        <div className="text-sm font-medium">{r.question}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">AI replied</div>
                        <div className="text-sm text-muted-foreground">{r.answer}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => delVoice(r.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{view?.prompt}</DialogTitle></DialogHeader>
          {view && <img src={view.image_url} alt={view.prompt} className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Card className="p-12 text-center text-muted-foreground">
      <div className="w-14 h-14 rounded-2xl mx-auto bg-gradient-brand-soft flex items-center justify-center mb-3">
        <ImageIcon className="w-6 h-6" />
      </div>
      {label}
    </Card>
  );
}
