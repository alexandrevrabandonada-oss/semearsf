-- Migration: supabase/migrations/20260309000011_conversar_moderacao.sql
-- Description: Adds moderation and anti-spam columns to conversation_comments

-- 1. Add columns to conversation_comments
ALTER TABLE public.conversation_comments ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'published';
ALTER TABLE public.conversation_comments ADD COLUMN IF NOT EXISTS ip_hash text;
ALTER TABLE public.conversation_comments ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.conversation_comments ADD COLUMN IF NOT EXISTS honeypot text;
ALTER TABLE public.conversation_comments ADD COLUMN IF NOT EXISTS reported_count int DEFAULT 0;

-- 2. Update RLS for public view
-- Assuming the previous migration had:
-- create policy "Visualização pública de comentários" on conversation_comments for select using (not is_hidden);
-- We update it to also check moderation_status

DROP POLICY IF EXISTS "Visualização pública de comentários" ON public.conversation_comments;
CREATE POLICY "Visualização pública de comentários" ON public.conversation_comments
  FOR SELECT
  USING (is_hidden = false AND moderation_status = 'published');

-- 3. Optionally lock down public INSERT if we want to enforce Edge Function only
-- For now, we will leave it open but the API will use the Edge Function.
-- If we want to be strict:
-- DROP POLICY IF EXISTS "Inserção pública de comentários" ON public.conversation_comments;
-- CREATE POLICY "Inserção pública de comentários" ON public.conversation_comments FOR INSERT WITH CHECK (false);
