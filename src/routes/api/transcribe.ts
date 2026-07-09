import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const incoming = await request.formData();
        const file = incoming.get("file");
        if (!(file instanceof Blob)) return new Response("Missing file", { status: 400 });

        const fd = new FormData();
        fd.append("model", "openai/gpt-4o-transcribe");
        // Preserve filename with correct extension
        const ext = file.type.includes("webm") ? "webm"
          : file.type.includes("mp4") ? "mp4"
          : file.type.includes("wav") ? "wav"
          : file.type.includes("mpeg") ? "mp3"
          : "webm";
        fd.append("file", file, `recording.${ext}`);

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: fd,
        });
        if (!upstream.ok) {
          const txt = await upstream.text();
          return new Response(txt, { status: upstream.status });
        }
        const json = await upstream.json();
        return new Response(JSON.stringify(json), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
