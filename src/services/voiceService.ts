import { generateImageFromVoice } from "@/lib/ai.functions";

export async function generateFromVoicePrompt(voice_text: string) {
  return await generateImageFromVoice({ data: { voice_text } });
}

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

export type LiveTranscriber = {
  stop: () => void;
};

export function startLiveTranscription(
  onUpdate: (finalText: string, interim: string) => void,
  onError: (msg: string) => void,
  lang = "en-US",
): LiveTranscriber | null {
  const Ctor =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = lang;
  rec.continuous = true;
  rec.interimResults = true;
  let finalText = "";
  rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript + " ";
      else interim += r[0].transcript;
    }
    onUpdate(finalText.trim(), interim);
  };
  rec.onerror = (e) => onError(e.error || "recognition error");
  rec.onend = () => {};
  try {
    rec.start();
  } catch (e) {
    onError((e as Error).message);
    return null;
  }
  return { stop: () => { try { rec.stop(); } catch { /* ignore */ } } };
}
