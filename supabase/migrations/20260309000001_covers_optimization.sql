-- Migration: Image Optimization (Acervo/Blog/Dossiês)
-- Adiciona colunas para thumbnails e imagens pequenas

-- 1. acervo_items
ALTER TABLE public.acervo_items
ADD COLUMN IF NOT EXISTS cover_url text,
ADD COLUMN IF NOT EXISTS cover_thumb_url text,
ADD COLUMN IF NOT EXISTS cover_small_url text;

-- 2. blog_posts
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS cover_thumb_url text,
ADD COLUMN IF NOT EXISTS cover_small_url text;

-- 3. acervo_collections
ALTER TABLE public.acervo_collections
ADD COLUMN IF NOT EXISTS cover_thumb_url text,
ADD COLUMN IF NOT EXISTS cover_small_url text;
