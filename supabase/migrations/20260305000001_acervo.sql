-- Migration: acervo (rework)
-- Substitui 20260304_000003_acervo_items.sql (mesma tabela, schema novo)
-- Idempotente: usa DROP IF EXISTS + CREATE TABLE IF NOT EXISTS

-- ─────────────────────────────────────────
-- Drop old table (was created empty by previous migration)
-- ─────────────────────────────────────────
drop table if exists public.acervo_items cascade;

-- ─────────────────────────────────────────
-- acervo_items
-- ─────────────────────────────────────────
create table if not exists public.acervo_items (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('paper','news','video','photo','report','link')),
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content_md   text,
  source_name  text,
  source_url   text,
  published_at date,
  year         int generated always as (extract(year from published_at)::int) stored,
  city         text not null default 'Volta Redonda',
  tags         text[] not null default '{}',
  meta         jsonb not null default '{}'::jsonb,
  search_vec   tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(content_md, '')), 'C')
  ) stored,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- acervo_editors
-- ─────────────────────────────────────────
create table if not exists public.acervo_editors (
  user_id    uuid primary key,
  email      text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────
create index if not exists idx_acervo_kind_year
  on public.acervo_items (kind, year desc);

create index if not exists idx_acervo_tags
  on public.acervo_items using gin (tags);

create index if not exists idx_acervo_search_vec
  on public.acervo_items using gin (search_vec);

-- ─────────────────────────────────────────
-- RLS: acervo_items
-- ─────────────────────────────────────────
alter table public.acervo_items enable row level security;

-- Public read
drop policy if exists acervo_items_select_public on public.acervo_items;
create policy acervo_items_select_public
  on public.acervo_items
  for select
  to anon, authenticated
  using (true);

-- Editors can insert/update/delete
drop policy if exists acervo_items_write_editors on public.acervo_items;
create policy acervo_items_write_editors
  on public.acervo_items
  for all
  to authenticated
  using (
    exists (
      select 1 from public.acervo_editors ae
      where ae.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.acervo_editors ae
      where ae.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- RLS: acervo_editors (service role only)
-- ─────────────────────────────────────────
alter table public.acervo_editors enable row level security;

-- No public policies → only postgres/service_role can access

-- ─────────────────────────────────────────
-- Grants
-- ─────────────────────────────────────────
revoke all on table public.acervo_items from anon, authenticated;
grant select on table public.acervo_items to anon;
grant select, insert, update, delete on table public.acervo_items to authenticated;

revoke all on table public.acervo_editors from anon, authenticated;
-- acervo_editors: no grants to anon/authenticated (service role only)
