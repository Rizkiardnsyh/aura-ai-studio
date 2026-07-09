import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2, Download, Loader2, ImageIcon } from "lucide-react";
import { generateImageFromPrompt, IMAGE_STYLES, type ImageStyle } from "@/services/imageService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/image-studio")({
  head: () => ({ meta: [{ title: "Image Studio — AI Creative Assistant" }] }),
  component: ImageStudio,
});

function ImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<ImageStyle>("Realistic");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ image_url: string; prompt: string; style: string | null } | null>(null);

  async function onGenerate() {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await generateImageFromPrompt(prompt.trim(), style);
      setResult(r);
      toast.success("Image generated and saved to history");
    } catch (e) {
      toast.error("Generation failed", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.image_url;
    a.download = `ai-image-${Date.now()}.png`;
    a.click();
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Image <span className="text-gradient-brand">Studio</span></h1>
        <p className="text-muted-foreground mt-1">Describe anything. Watch it come to life.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="p-6 space-y-5 h-fit">
          <div>
            <label className="text-sm font-medium mb-2 block">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Robot futuristik di kota Jakarta tahun 2050..."
              rows={5}
              className="resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Style</label>
            <div className="grid grid-cols-3 gap-2">
              {IMAGE_STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={
                    "rounded-lg px-3 py-2 text-sm border transition-all " +
                    (style === s
                      ? "bg-gradient-brand text-white border-transparent shadow-glow"
                      : "border-border hover:bg-accent")
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={onGenerate} disabled={loading} className="w-full h-11 bg-gradient-brand text-white shadow-glow">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
            {loading ? "Generating..." : "Generate Image"}
          </Button>
        </Card>

        <Card className="min-h-[420px] flex items-center justify-center overflow-hidden p-4">
          {loading && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-brand animate-pulse shadow-glow" />
              <p className="mt-4 text-sm text-muted-foreground">Painting your idea...</p>
            </div>
          )}
          {!loading && !result && (
            <div className="text-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto opacity-40" />
              <p className="mt-2 text-sm">Your generated image will appear here</p>
            </div>
          )}
          {!loading && result && (
            <div className="w-full space-y-4">
              <img src={result.image_url} alt={result.prompt} className="w-full rounded-xl shadow-lg" />
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm min-w-0">
                  <div className="font-medium truncate">{result.prompt}</div>
                  {result.style && <div className="text-xs text-muted-foreground mt-0.5">Style: {result.style}</div>}
                </div>
                <Button variant="outline" size="sm" onClick={download}>
                  <Download className="w-4 h-4 mr-1" /> Download
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
