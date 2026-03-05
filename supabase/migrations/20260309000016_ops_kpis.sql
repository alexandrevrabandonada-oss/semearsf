-- Operational KPIs RPCs for transparency (last 7 days)

-- RPC: get_ops_kpis_7d
-- Returns operational metrics for last 7 days
CREATE OR REPLACE FUNCTION public.get_ops_kpis_7d()
RETURNS TABLE (
  total_measurements bigint,
  total_ingest_events bigint,
  inserted_count bigint,
  duplicated_count bigint,
  total_push_alerts bigint,
  total_events bigint,
  total_acervo_items bigint,
  total_blog_posts bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.measurements WHERE ts > NOW() - INTERVAL '7 days')::bigint AS total_measurements,
    (SELECT COUNT(*) FROM public.ingest_logs WHERE created_at > NOW() - INTERVAL '7 days')::bigint AS total_ingest_events,
    (SELECT COUNT(*) FROM public.ingest_logs WHERE inserted = true AND created_at > NOW() - INTERVAL '7 days')::bigint AS inserted_count,
    (SELECT COUNT(*) FROM public.ingest_logs WHERE duplicated = true AND created_at > NOW() - INTERVAL '7 days')::bigint AS duplicated_count,
    (SELECT COUNT(*) FROM public.push_events WHERE ts > NOW() - INTERVAL '7 days')::bigint AS total_push_alerts,
    (SELECT COUNT(*) FROM public.events WHERE created_at > NOW() - INTERVAL '7 days')::bigint AS total_events,
    (SELECT COUNT(*) FROM public.acervo_items WHERE created_at > NOW() - INTERVAL '7 days')::bigint AS total_acervo_items,
    (SELECT COUNT(*) FROM public.blog_posts WHERE created_at > NOW() - INTERVAL '7 days')::bigint AS total_blog_posts;
END;
$$ LANGUAGE plpgsql STABLE;

-- RPC: get_station_kpis_7d
-- Returns measurements count per station (last 7 days)
CREATE OR REPLACE FUNCTION public.get_station_kpis_7d()
RETURNS TABLE (
  station_code text,
  station_name text,
  measurements_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.code,
    s.name,
    COUNT(m.id)::bigint
  FROM public.stations s
  LEFT JOIN public.measurements m ON m.station_id = s.id AND m.ts > NOW() - INTERVAL '7 days'
  GROUP BY s.id, s.code, s.name
  ORDER BY COUNT(m.id) DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions for public access
GRANT EXECUTE ON FUNCTION public.get_ops_kpis_7d() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_station_kpis_7d() TO anon, authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.get_ops_kpis_7d() IS 'Returns operational KPIs for the last 7 days: measurements, ingest events, push alerts, content published.';
COMMENT ON FUNCTION public.get_station_kpis_7d() IS 'Returns measurements count grouped by station for the last 7 days.';
