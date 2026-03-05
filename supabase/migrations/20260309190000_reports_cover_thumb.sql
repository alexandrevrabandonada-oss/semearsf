-- Reports v4: guarantee cover fields for premium thumbnails / OG
-- Idempotent migration

alter table if exists public.reports
  add column if not exists cover_url text;

alter table if exists public.reports
  add column if not exists cover_thumb_url text;
