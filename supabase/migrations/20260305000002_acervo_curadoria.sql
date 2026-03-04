-- Migration: acervo_curadoria
-- Adiciona colunas para curadoria real e destaques

alter table public.acervo_items 
  add column if not exists curator_note text,
  add column if not exists authors      text,
  add column if not exists doi          text,
  add column if not exists featured     boolean not null default false,
  add column if not exists source_type  text;

-- Índices úteis
create index if not exists idx_acervo_featured 
  on public.acervo_items (featured) 
  where featured = true;

create index if not exists idx_acervo_kind_year_featured
  on public.acervo_items (kind, year desc, featured);

-- Refresh search_vec triggers if necessary (generated column will auto-update if listed)
-- search_vec in 20260305_000001 only includes title, excerpt, content_md.
-- We might want to add authors to it.
alter table public.acervo_items 
  drop column if exists search_vec;

alter table public.acervo_items
  add column search_vec tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(authors, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(curator_note, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(content_md, '')), 'D')
  ) stored;

create index if not exists idx_acervo_search_vec 
  on public.acervo_items using gin (search_vec);
