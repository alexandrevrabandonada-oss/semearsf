-- Enforce scheduled publish visibility in timeline/search RPCs

CREATE OR REPLACE FUNCTION public.get_acervo_year_index()
RETURNS TABLE (
    year int,
    total int
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        EXTRACT(YEAR FROM published_at)::int as year,
        COUNT(*)::int as total
    FROM public.acervo_items
    WHERE published_at IS NOT NULL
      AND (publish_at IS NULL OR publish_at <= now())
    GROUP BY EXTRACT(YEAR FROM published_at)
    ORDER BY year DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_acervo_year_index() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_acervo_by_year(p_year int, p_limit int DEFAULT 200)
RETURNS SETOF public.acervo_items
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM public.acervo_items
    WHERE EXTRACT(YEAR FROM published_at) = p_year
      AND (publish_at IS NULL OR publish_at <= now())
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_acervo_by_year(int, int) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.search_all(p_q text, p_limit int default 20)
RETURNS TABLE (
    kind text,
    title text,
    slug text,
    excerpt text,
    score real,
    url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH tsq AS (
        SELECT websearch_to_tsquery('portuguese', p_q) AS q
    )
    SELECT
        cast('acervo' as text) as kind,
        a.title,
        a.slug,
        a.excerpt,
        cast(ts_rank(a.search_vec, tsq.q) as real) as score,
        cast('/acervo/item/' || a.slug as text) as url
    FROM public.acervo_items a, tsq
    WHERE a.search_vec @@ tsq.q
      AND (a.publish_at IS NULL OR a.publish_at <= now())

    UNION ALL

    SELECT
        cast('blog' as text) as kind,
        b.title,
        b.slug,
        b.excerpt,
        cast(ts_rank(b.search_vec, tsq.q) as real) as score,
        cast('/blog/' || b.slug as text) as url
    FROM public.blog_posts b, tsq
    WHERE b.search_vec @@ tsq.q
      AND b.status = 'published'
      AND (b.publish_at IS NULL OR b.publish_at <= now())

    ORDER BY score DESC
    LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_all(text, int) TO anon, authenticated;
