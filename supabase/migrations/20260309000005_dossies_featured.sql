-- Migration: Featured Dossiês
-- Date: 2026-03-09
-- Description: Adds featured flag and editorial position to acervo_collections.

ALTER TABLE public.acervo_collections 
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

ALTER TABLE public.acervo_collections 
ADD COLUMN IF NOT EXISTS position int DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_collections_featured 
ON public.acervo_collections(featured, position);
