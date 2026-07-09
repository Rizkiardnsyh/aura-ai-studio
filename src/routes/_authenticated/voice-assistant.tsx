import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Mic, Square, Loader2, Volume2 } from "lucide-react";
import { askAssistant, startRecording, synthesizeSpeech, transcribeAudio } from "@/services/voiceService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/voice-assistant")({
  head: () => ({ meta: [{ title: "Voice Assistant — AI Creative Assistant" }] }),
  component: VoiceAssistant,
});

type Msg = { role: "user" | "assistant"; text: string; audio?: string };

function VoiceAssistant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const recRef = useRef<{ stop: () => Promise<Blob> } | null>(null);

  async function start() {
    try {
      const r = await startRecording();
      recRef.current = r;
      setRecording(true);
    } catch (e) {
      toast.error("Microphone access denied", { description: (e as Error).message });
    }
  }

  async function stop() {
    if (!recRef.current) return;
    setRecording(false);
    setProcessing(true);
    try {
      const blob = await recRef.current.stop();
      recRef.current = null;
      const text = await transcribeAudio(blob);
      if (!text.trim()) {
        toast.error("Couldn't hear you", { description: "Try recording again." });
        return;
      }
      setMessages((m) => [...m, { role: "user", text }]);
      const { answer } = await askAssistant(text);
      const audio = await synthesizeSpeech(answer).catch(() => undefined);
      setMessages((m) => [...m, { role: "assistant", text: answer, audio }]);
      if (audio) new Audio(audio).play().catch(() => {});
    } catch (e) {
      toast.error("Voice interaction failed", { description: (e as Error).message });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Voice <span className="text-gradient-brand">Assistant</span></h1>
        <p className="text-muted-foreground mt-1">Press the mic, speak naturally, listen to AI reply.</p>
      </div>

      <Card className="p-6 min-h-[420px] flex flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground text-sm">
              <div>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-brand-soft flex items-center justify-center mb-3">
                  <Mic className="w-7 h-7 text-primary" />
                </div>
                Tap the microphone below and ask anything.
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm " +
                  (m.role === "user"
                    ? "bg-gradient-brand text-white shadow-glow rounded-br-sm"
                    : "bg-secondary text-secondary-foreground rounded-bl-sm")
                }
              >
                <div>{m.text}</div>
                {m.audio && (
                  <button
                    onClick={() => new Audio(m.audio).play()}
                    className="mt-2 flex items-center gap-1.5 text-xs opacity-80 hover:opacity-100"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Play
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          {recording ? (
            <Button onClick={stop} className="h-16 w-16 rounded-full bg-destructive text-white animate-pulse">
              <Square className="w-6 h-6" />
            </Button>
          ) : processing ? (
            <Button disabled className="h-16 w-16 rounded-full">
              <Loader2 className="w-6 h-6 animate-spin" />
            </Button>
          ) : (
            <Button onClick={start} className="h-16 w-16 rounded-full bg-gradient-brand text-white shadow-glow">
              <Mic className="w-6 h-6" />
            </Button>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          {recording ? "Recording... tap to stop" : processing ? "Thinking..." : "Tap to start recording"}
        </p>
      </Card>
    </div>
  );
}
