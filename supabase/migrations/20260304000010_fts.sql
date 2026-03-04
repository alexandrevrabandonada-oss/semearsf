-- Migration: Full-Text Search (FTS) for Acervo and Blog

-- Create an immutable wrapper for array_to_string to use in generated columns
CREATE OR REPLACE FUNCTION public.immutable_array_to_string(arr text[], sep text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
    SELECT array_to_string(arr, sep);
$$;

-- 1. Add generated tsvector column and GIN index to acervo_items
ALTER TABLE public.acervo_items DROP COLUMN IF EXISTS search_vec CASCADE;

ALTER TABLE public.acervo_items
ADD COLUMN search_vec tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(source_name, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(public.immutable_array_to_string(tags, ' '), '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(content_md, '')), 'D')
) STORED;

CREATE INDEX IF NOT EXISTS acervo_items_search_idx ON public.acervo_items USING GIN (search_vec);

-- 2. Add generated tsvector column and GIN index to blog_posts
ALTER TABLE public.blog_posts DROP COLUMN IF EXISTS search_vec CASCADE;

ALTER TABLE public.blog_posts
ADD COLUMN search_vec tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(public.immutable_array_to_string(tags, ' '), '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(content_md, '')), 'D')
) STORED;

CREATE INDEX IF NOT EXISTS blog_posts_search_idx ON public.blog_posts USING GIN (search_vec);

-- 3. Create RPC search_all
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

    UNION ALL

    SELECT
        cast('blog' as text) as kind,
        b.title,
        b.slug,
        b.excerpt,
        cast(ts_rank(b.search_vec, tsq.q) as real) as score,
        cast('/blog/' || b.slug as text) as url
    FROM public.blog_posts b, tsq
    WHERE b.search_vec @@ tsq.q AND b.status = 'published'

    ORDER BY score DESC
    LIMIT p_limit;
END;
$$;

-- Grant permissions to public roles
GRANT EXECUTE ON FUNCTION public.search_all(text, int) TO anon, authenticated;
