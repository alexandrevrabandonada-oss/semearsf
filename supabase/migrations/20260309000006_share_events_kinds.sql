-- Migration: Share Events Extensibility
-- Date: 2026-03-09
-- Description: Expand the kind constraint on share_events to support 'dossies' and 'dados'.

ALTER TABLE public.share_events DROP CONSTRAINT IF EXISTS share_events_kind_check;

ALTER TABLE public.share_events 
ADD CONSTRAINT share_events_kind_check 
CHECK (kind IN ('acervo', 'blog', 'dossies', 'dados'));
