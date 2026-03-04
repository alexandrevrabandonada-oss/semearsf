-- Migration: acervo_items
-- Idempotente: usa IF NOT EXISTS e CREATE OR REPLACE

create table if not exists public.acervo_items (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  area         text not null check (area in ('artigos', 'noticias', 'midias')),
  title        text not null,
  summary      text,
  body         text,
  source       text,
  published_at timestamptz,
  tags         jsonb not null default '[]',
  links        jsonb not null default '[]',
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists ix_acervo_items_area_published_at
  on public.acervo_items (area, published_at desc);

create index if not exists ix_acervo_items_slug
  on public.acervo_items (slug);

alter table public.acervo_items enable row level security;

drop policy if exists acervo_items_select_published on public.acervo_items;
create policy acervo_items_select_published
  on public.acervo_items
  for select
  to anon, authenticated
  using (true);

revoke all on table public.acervo_items from anon, authenticated;
grant select on table public.acervo_items to anon, authenticated;
