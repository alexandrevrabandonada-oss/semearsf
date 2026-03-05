-- Refresh operational KPI RPCs with explicit "published" semantics and RLS-safe execution.
-- Idempotent by design: DROP IF EXISTS + CREATE OR REPLACE + GRANT.

DROP FUNCTION IF EXISTS public.get_ops_kpis_7d();
DROP FUNCTION IF EXISTS public.get_station_kpis_7d();

CREATE OR REPLACE FUNCTION public.get_ops_kpis_7d()
RETURNS TABLE (
  total_measurements bigint,
  inserted_count bigint,
  duplicated_count bigint,
  total_push_alerts bigint,
  published_events_count bigint,
  published_acervo_items_count bigint,
  published_blog_posts_count bigint,
  published_content_items_count bigint
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
    (SELECT COUNT(*) FROM public.acervo_items WHERE created_at > NOW() - INTERVAL '7 days')::bigint AS published_acervo_items_count,
    (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published' AND COALESCE(published_at, created_at) > NOW() - INTERVAL '7 days')::bigint AS published_blog_posts_count,
    (
      (SELECT COUNT(*) FROM public.acervo_items WHERE created_at > NOW() - INTERVAL '7 days') +
      (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published' AND COALESCE(published_at, created_at) > NOW() - INTERVAL '7 days')
    )::bigint AS published_content_items_count;
$$;

CREATE OR REPLACE FUNCTION public.get_station_kpis_7d()
RETURNS TABLE (
  station_code text,
  station_name text,
  measurements_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.code AS station_code,
    s.name AS station_name,
    COUNT(m.id)::bigint AS measurements_count
  FROM public.stations s
  LEFT JOIN public.measurements m
    ON m.station_id = s.id
   AND m.ts > NOW() - INTERVAL '7 days'
  GROUP BY s.id, s.code, s.name
  ORDER BY COUNT(m.id) DESC, s.name ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_ops_kpis_7d() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_station_kpis_7d() TO anon, authenticated;

COMMENT ON FUNCTION public.get_ops_kpis_7d() IS 'KPIs of operations in the last 7 days: measurements, ingest inserted/duplicated, triggered alerts, and published content.';
COMMENT ON FUNCTION public.get_station_kpis_7d() IS 'Measurements grouped by station in the last 7 days.';
