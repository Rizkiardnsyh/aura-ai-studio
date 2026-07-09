
CREATE TABLE public.voice_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  voice_text text not null,
  generated_image_url text not null,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_history TO authenticated;
GRANT ALL ON public.voice_history TO service_role;
ALTER TABLE public.voice_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own voice_history all" ON public.voice_history
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX voice_history_user_created_idx ON public.voice_history(user_id, created_at DESC);
