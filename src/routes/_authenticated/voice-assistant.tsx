import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Wand2, Download, ImageIcon, AlertCircle } from "lucide-react";
import {
  generateFromVoicePrompt,
  isSpeechRecognitionSupported,
  startLiveTranscription,
  type LiveTranscriber,
} from "@/services/voiceService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/voice-assistant")({
  head: () => ({ meta: [{ title: "Voice Assistant — AI Creative Assistant" }] }),
  component: VoiceAssistant,
});

function VoiceAssistant() {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ image_url: string; voice_text: string } | null>(null);
  const recRef = useRef<LiveTranscriber | null>(null);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
    return () => recRef.current?.stop();
  }, []);

  function startRec() {
    setInterim("");
    const rec = startLiveTranscription(
      (finalText, live) => {
        if (finalText) setPrompt(finalText);
        setInterim(live);
      },
      (err) => {
        toast.error("Microphone error", { description: err });
        setRecording(false);
      },
    );
    if (!rec) {
      toast.error("Speech recognition unavailable in this browser");
      return;
    }
    recRef.current = rec;
    setRecording(true);
  }

  function stopRec() {
    recRef.current?.stop();
    recRef.current = null;
    setRecording(false);
    setInterim("");
  }

  async function generate() {
    const text = prompt.trim();
    if (!text) {
      toast.error("Prompt is empty");
      return;
    }
    setGenerating(true);
    setResult(null);
    try {
      const r = await generateFromVoicePrompt(text);
      setResult({ image_url: r.image_url, voice_text: r.voice_text });
      toast.success("Image generated and saved to voice history");
    } catch (e) {
      toast.error("Generation failed", { description: (e as Error).message });
    } finally {
      setGenerating(false);
    }
  }

  function download() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.image_url;
    a.download = `voice-image-${Date.now()}.png`;
    a.click();
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Voice <span className="text-gradient-brand">To Image</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Speak your idea aloud. Edit the transcribed prompt if needed. Watch AI turn it into art.
        </p>
      </div>

      {!supported && (
        <Card className="mb-6 p-4 border-amber-500/40 bg-amber-500/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium">Speech Recognition not supported</div>
            <p className="text-muted-foreground mt-1">
              Your browser doesn't support the Web Speech API. You can still type a prompt below and generate.
              For best results, use Google Chrome on desktop.
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Input */}
        <Card className="p-6 space-y-5 h-fit">
          <div className="flex flex-col items-center py-4">
            {recording ? (
              <Button onClick={stopRec} className="h-20 w-20 rounded-full bg-destructive text-white animate-pulse shadow-glow">
                <Square className="w-7 h-7" />
              </Button>
            ) : (
              <Button
                onClick={startRec}
                disabled={!supported}
                className="h-20 w-20 rounded-full bg-gradient-brand text-white shadow-glow hover:scale-105 transition-transform"
              >
                <Mic className="w-7 h-7" />
              </Button>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              {recording ? "Listening… tap to stop" : "Tap microphone to start speaking"}
            </p>
            {recording && (
              <div className="flex items-end gap-1 h-6 mt-3">
                {[8, 16, 12, 20, 10, 18, 14].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-gradient-brand animate-pulse"
                    style={{ height: h, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Detected prompt (edit before generating)</label>
            <Textarea
              value={prompt + (interim ? ` ${interim}` : "")}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Try: "Create a futuristic city at night with flying cars"'
              rows={5}
              className="resize-none"
            />
            {interim && <div className="text-xs text-muted-foreground mt-1 italic">Listening: {interim}…</div>}
          </div>

          <Button
            onClick={generate}
            disabled={generating || !prompt.trim()}
            className="w-full h-11 bg-gradient-brand text-white shadow-glow"
          >
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
            {generating ? "Generating..." : "Generate Image from Voice"}
          </Button>
        </Card>

        {/* Result */}
        <Card className="min-h-[420px] flex items-center justify-center overflow-hidden p-4">
          {generating && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-brand animate-pulse shadow-glow" />
              <p className="mt-4 text-sm text-muted-foreground">Bringing your voice to life…</p>
            </div>
          )}
          {!generating && !result && (
            <div className="text-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto opacity-40" />
              <p className="mt-2 text-sm">Your voice-generated image will appear here</p>
            </div>
          )}
          {!generating && result && (
            <div className="w-full space-y-4">
              <img src={result.image_url} alt={result.voice_text} className="w-full rounded-xl shadow-lg" />
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">You said</div>
                  <div className="font-medium">{result.voice_text}</div>
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
