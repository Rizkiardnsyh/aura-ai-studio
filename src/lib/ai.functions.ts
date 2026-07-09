import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

/** Generate an image using Lovable AI Gateway (Gemini image). Returns a data URL. */
export const generateImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ prompt: z.string().min(1).max(2000), style: z.string().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const styledPrompt = data.style
      ? `${data.prompt}. Style: ${data.style}. High quality, detailed.`
      : data.prompt;

    const resp = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: styledPrompt }],
        modalities: ["image", "text"],
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      if (resp.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Please upgrade your plan.");
      throw new Error(`Image generation failed: ${t}`);
    }
    const json = await resp.json() as {
      choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
    };
    const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) throw new Error("No image returned from AI");

    // Save to DB
    const { data: row, error } = await context.supabase
      .from("image_generations")
      .insert({
        user_id: context.userId,
        prompt: data.prompt,
        style: data.style ?? null,
        image_url: url,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, image_url: url, prompt: data.prompt, style: data.style ?? null };
  });

/** Chat with AI (text response). Persists Q&A. */
export const chatWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ question: z.string().min(1).max(4000) }).parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const resp = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a helpful, friendly AI voice assistant. Keep responses concise (2-4 sentences) and natural for spoken conversation." },
          { role: "user", content: data.question },
        ],
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      if (resp.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Please upgrade your plan.");
      throw new Error(`Chat failed: ${t}`);
    }
    const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
    const answer = json.choices?.[0]?.message?.content ?? "";
    if (!answer) throw new Error("No response from AI");

    const { data: row, error } = await context.supabase
      .from("voice_sessions")
      .insert({
        user_id: context.userId,
        question: data.question,
        answer,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, answer };
  });
