# AI Creative Assistant

A modern full-stack AI SaaS platform with two flagship features:

- 🎨 **AI Image Generator** – turn text prompts into stunning images
- 🎙️ **Voice → Image Assistant** – speak your idea, edit the prompt, generate art

Built with React 19, TanStack Start, Tailwind v4, shadcn/ui, and Supabase.

## Features

- Google OAuth sign-in
- Sidebar dashboard layout
- Image Studio (with style presets, prompt suggestions, progress indicator, download)
- Voice To Image (browser Web Speech API for live transcription, editable prompt, AI image generation)
- Unified History (Images + Voice) with view / download / delete
- Personal Profile (Google name, avatar, email, stats)
- Row Level Security on all user data

## Local Development

### 1. Install dependencies

```bash
npm install
# or: bun install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
LOVABLE_API_KEY=...   # Lovable AI Gateway key (server-side)
```

**No hardcoded API keys** – everything is read from environment variables.

### 3. Run the dev server

```bash
npm run dev
```

App will be available at `http://localhost:8080`.

## Project Structure

```
src/
  routes/
    __root.tsx                # Root layout, providers, metadata
    index.tsx                 # Landing / redirect
    auth.tsx                  # Google login page
    _authenticated/           # Auth-gated subtree
      route.tsx               # Auth guard (integration-managed)
      dashboard.tsx
      image-studio.tsx
      voice-assistant.tsx     # Voice → Image
      history.tsx
      profile.tsx
    api/                      # Public HTTP endpoints (transcribe, tts)
  components/                 # UI + layout
  lib/ai.functions.ts         # Typed server functions (image gen, chat)
  services/                   # Client-side wrappers
  integrations/supabase/      # Auto-generated Supabase client & types
```

## Database

Three user-scoped tables, all secured with Row Level Security:

- `profiles` – user profile mirror
- `image_generations` – text-to-image history
- `voice_history` – voice-to-image history (`voice_text`, `generated_image_url`)

## Deployment

The app runs on TanStack Start's serverless runtime. Any Node/Edge-compatible host works. Publish through Lovable, or `npm run build` and deploy the output.

## License

MIT
