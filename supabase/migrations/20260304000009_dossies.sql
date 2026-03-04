-- Migration: Dossiês (Collections) no Acervo
-- Date: 2026-03-04

-- 1. Tabelas
create table if not exists public.acervo_collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  cover_url text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists public.acervo_collection_items (
  collection_id uuid references public.acervo_collections(id) on delete cascade,
  item_id uuid references public.acervo_items(id) on delete cascade,
  position int default 0,
  primary key (collection_id, item_id)
);

-- 2. Índices
create index if not exists idx_collections_slug on public.acervo_collections(slug);
create index if not exists idx_collection_items_order on public.acervo_collection_items(collection_id, position);

-- 3. RLS Policies
alter table public.acervo_collections enable row level security;
alter table public.acervo_collection_items enable row level security;

-- Public read access
create policy "Public read collections"
  on public.acervo_collections for select
  using (true);

create policy "Public read collection items"
  on public.acervo_collection_items for select
  using (true);

-- Service role write access (inherited by lack of other policies)
-- No specific INSERT/UPDATE policies means only bypass-RLS (service role) can write.
