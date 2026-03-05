-- Add advanced moderation columns to conversation_comments
ALTER TABLE public.conversation_comments
  ADD COLUMN IF NOT EXISTS reported_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS ip_hash text,
  ADD COLUMN IF NOT EXISTS user_agent text;

-- Index for rate limiting queries (ip_hash + created_at)
CREATE INDEX IF NOT EXISTS idx_comments_ip_hash_created ON public.conversation_comments(ip_hash, created_at DESC);

-- Index for moderation queries
CREATE INDEX IF NOT EXISTS idx_comments_moderation_status ON public.conversation_comments(moderation_status);

-- Comments policy: Hide comments with is_hidden=true OR moderation_status='queued' (unless service_role)
DROP POLICY IF EXISTS "Público pode ver comentários não ocultos" ON public.conversation_comments;

CREATE POLICY "Público pode ver comentários publicados"
  ON public.conversation_comments FOR SELECT
  TO anon, authenticated
  USING (is_hidden = false AND moderation_status = 'published');

-- Service role can see all
CREATE POLICY "Service role acesso total"
  ON public.conversation_comments FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON COLUMN public.conversation_comments.reported_count IS 'Number of reports received. Hidden if >= 3.';
COMMENT ON COLUMN public.conversation_comments.moderation_status IS 'Status: published (immediate display), queued (awaiting review)';
COMMENT ON COLUMN public.conversation_comments.ip_hash IS 'SHA-256 hash of submitter IP (rate limiting, privacy-preserving).';
COMMENT ON COLUMN public.conversation_comments.user_agent IS 'User-Agent header for context/debugging.';
