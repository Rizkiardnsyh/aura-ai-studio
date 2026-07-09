import { chatWithAi } from "@/lib/ai.functions";

export async function transcribeAudio(blob: Blob): Promise<string> {
  const fd = new FormData();
  fd.append("file", blob, "recording.webm");
  const res = await fetch("/api/transcribe", { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Transcription failed: ${await res.text()}`);
  const json = (await res.json()) as { text?: string };
  return json.text ?? "";
}

export async function askAssistant(question: string) {
  return await chatWithAi({ data: { question } });
}

export async function synthesizeSpeech(text: string): Promise<string> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`TTS failed: ${await res.text()}`);
  const buf = await res.arrayBuffer();
  const blob = new Blob([buf], { type: "audio/mpeg" });
  return URL.createObjectURL(blob);
}

/** Record microphone until stop() is called. */
export function startRecording(): Promise<{ stop: () => Promise<Blob> }> {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      const stopPromise = new Promise<Blob>((res) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          res(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
        };
      });
      recorder.start();
      resolve({ stop: async () => { recorder.stop(); return stopPromise; } });
    } catch (e) {
      reject(e);
    }
  });
}
