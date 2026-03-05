CREATE OR REPLACE FUNCTION public.get_ops_kpis_month(p_year integer, p_month integer)
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
  WITH bounds AS (
    SELECT
      make_date(p_year, p_month, 1)::timestamptz AS month_start,
      (make_date(p_year, p_month, 1) + INTERVAL '1 month')::timestamptz AS month_end
  )
  SELECT
    (SELECT COUNT(*) FROM public.measurements m, bounds b WHERE m.ts >= b.month_start AND m.ts < b.month_end)::bigint AS total_measurements,
    (SELECT COUNT(*) FROM public.ingest_logs i, bounds b WHERE i.inserted = true AND i.created_at >= b.month_start AND i.created_at < b.month_end)::bigint AS inserted_count,
    (SELECT COUNT(*) FROM public.ingest_logs i, bounds b WHERE i.duplicated = true AND i.created_at >= b.month_start AND i.created_at < b.month_end)::bigint AS duplicated_count,
    (SELECT COUNT(*) FROM public.push_events p, bounds b WHERE p.triggered = true AND p.ts >= b.month_start AND p.ts < b.month_end)::bigint AS total_push_alerts,
    (SELECT COUNT(*) FROM public.events e, bounds b WHERE e.status = 'published' AND e.created_at >= b.month_start AND e.created_at < b.month_end)::bigint AS published_events_count,
    (SELECT COUNT(*) FROM public.acervo_items a, bounds b WHERE (a.publish_at IS NULL OR a.publish_at <= now()) AND a.created_at >= b.month_start AND a.created_at < b.month_end)::bigint AS published_acervo_items_count,
    (SELECT COUNT(*) FROM public.blog_posts bp, bounds b WHERE bp.status = 'published' AND (bp.publish_at IS NULL OR bp.publish_at <= now()) AND COALESCE(bp.publish_at, bp.published_at, bp.created_at) >= b.month_start AND COALESCE(bp.publish_at, bp.published_at, bp.created_at) < b.month_end)::bigint AS published_blog_posts_count,
    (
      (SELECT COUNT(*) FROM public.acervo_items a, bounds b WHERE (a.publish_at IS NULL OR a.publish_at <= now()) AND a.created_at >= b.month_start AND a.created_at < b.month_end) +
      (SELECT COUNT(*) FROM public.blog_posts bp, bounds b WHERE bp.status = 'published' AND (bp.publish_at IS NULL OR bp.publish_at <= now()) AND COALESCE(bp.publish_at, bp.published_at, bp.created_at) >= b.month_start AND COALESCE(bp.publish_at, bp.published_at, bp.created_at) < b.month_end)
    )::bigint AS published_content_items_count,
    (SELECT COUNT(*) FROM public.acervo_items WHERE publish_at > now())::bigint AS scheduled_acervo_items_count,
    (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published' AND publish_at > now())::bigint AS scheduled_blog_posts_count,
    (
      (SELECT COUNT(*) FROM public.acervo_items WHERE publish_at > now()) +
      (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published' AND publish_at > now())
    )::bigint AS scheduled_content_items_count;
$$;

GRANT EXECUTE ON FUNCTION public.get_ops_kpis_month(integer, integer) TO anon, authenticated;

COMMENT ON FUNCTION public.get_ops_kpis_month(integer, integer) IS 'Monthly operational KPIs by year/month: measurements, ingest, triggered alerts, published content and scheduled content.';
