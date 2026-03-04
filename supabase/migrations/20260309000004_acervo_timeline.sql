-- Migration: Acervo Timeline
-- Date: 2026-03-09
-- Description: Creates RPCs to support year-based timeline navigation in the Acervo module.

-- 1) get_acervo_year_index
-- Returns a list of years and the count of items published in each year.
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
    GROUP BY EXTRACT(YEAR FROM published_at)
    ORDER BY year DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_acervo_year_index() TO anon, authenticated;

-- 2) get_acervo_by_year
-- Returns items published in a specific year.
CREATE OR REPLACE FUNCTION public.get_acervo_by_year(p_year int, p_limit int DEFAULT 200)
RETURNS SETOF public.acervo_items
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM public.acervo_items
    WHERE EXTRACT(YEAR FROM published_at) = p_year
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_acervo_by_year(int, int) TO anon, authenticated;
