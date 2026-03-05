-- Scheduled publishing support for blog + acervo (idempotent)

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS publish_at timestamptz;

ALTER TABLE public.acervo_items
  ADD COLUMN IF NOT EXISTS publish_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_at
  ON public.blog_posts (publish_at DESC);

CREATE INDEX IF NOT EXISTS idx_acervo_items_publish_at
  ON public.acervo_items (publish_at DESC);

DROP POLICY IF EXISTS "blog_posts_select_public" ON public.blog_posts;
CREATE POLICY "blog_posts_select_public" ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    AND (publish_at IS NULL OR publish_at <= now())
  );

DROP POLICY IF EXISTS acervo_items_select_public ON public.acervo_items;
CREATE POLICY acervo_items_select_public
  ON public.acervo_items
  FOR SELECT
  TO anon, authenticated
  USING (
    publish_at IS NULL OR publish_at <= now()
  );

DROP FUNCTION IF EXISTS public.get_ops_kpis_7d();

CREATE OR REPLACE FUNCTION public.get_ops_kpis_7d()
RETURNS TABLE (
  total_measurements bigint,
  inserted_count bigint,
  duplicated_count bigint,
  total_push_alerts bigint,
  published_events_count bigint,
  published_acervo_items_count bigint,
  published_blog_posts_count bigint,
  published_content_items_count bigint,
  scheduled_acervo_items_count bigint,
  scheduled_blog_posts_count bigint,
  scheduled_content_items_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM public.measurements WHERE ts > NOW() - INTERVAL '7 days')::bigint AS total_measurements,
    (SELECT COUNT(*) FROM public.ingest_logs WHERE inserted = true AND created_at > NOW() - INTERVAL '7 days')::bigint AS inserted_count,
    (SELECT COUNT(*) FROM public.ingest_logs WHERE duplicated = true AND created_at > NOW() - INTERVAL '7 days')::bigint AS duplicated_count,
    (SELECT COUNT(*) FROM public.push_events WHERE triggered = true AND ts > NOW() - INTERVAL '7 days')::bigint AS total_push_alerts,
    (SELECT COUNT(*) FROM public.events WHERE status = 'published' AND created_at > NOW() - INTERVAL '7 days')::bigint AS published_events_count,
    (SELECT COUNT(*) FROM public.acervo_items WHERE (publish_at IS NULL OR publish_at <= NOW()) AND created_at > NOW() - INTERVAL '7 days')::bigint AS published_acervo_items_count,
    (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published' AND (publish_at IS NULL OR publish_at <= NOW()) AND COALESCE(publish_at, published_at, created_at) > NOW() - INTERVAL '7 days')::bigint AS published_blog_posts_count,
    (
      (SELECT COUNT(*) FROM public.acervo_items WHERE (publish_at IS NULL OR publish_at <= NOW()) AND created_at > NOW() - INTERVAL '7 days') +
      (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published' AND (publish_at IS NULL OR publish_at <= NOW()) AND COALESCE(publish_at, published_at, created_at) > NOW() - INTERVAL '7 days')
    )::bigint AS published_content_items_count,
    (SELECT COUNT(*) FROM public.acervo_items WHERE publish_at > NOW())::bigint AS scheduled_acervo_items_count,
    (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published' AND publish_at > NOW())::bigint AS scheduled_blog_posts_count,
    (
      (SELECT COUNT(*) FROM public.acervo_items WHERE publish_at > NOW()) +
      (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published' AND publish_at > NOW())
    )::bigint AS scheduled_content_items_count;
$$;

GRANT EXECUTE ON FUNCTION public.get_ops_kpis_7d() TO anon, authenticated;

COMMENT ON FUNCTION public.get_ops_kpis_7d() IS 'KPIs for last 7 days plus scheduled content counters (blog + acervo).';
