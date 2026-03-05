-- Create climate_corridors table
create table if not exists public.climate_corridors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  geometry_json jsonb,
  featured boolean default false,
  created_at timestamptz default now(),
  meta jsonb default '{}'::jsonb
);

-- Create climate_corridor_links table
create table if not exists public.climate_corridor_links (
  corridor_id uuid references public.climate_corridors(id) on delete cascade,
  item_kind text not null, -- 'station', 'acervo', 'blog', 'event'
  item_ref text not null,  -- usually a slug or string ID
  position int default 0,
  primary key (corridor_id, item_kind, item_ref)
);

-- Indices
create index if not exists idx_climate_corridors_slug on public.climate_corridors(slug);
create index if not exists idx_climate_corridors_featured on public.climate_corridors(featured);

-- RLS
alter table public.climate_corridors enable row level security;
alter table public.climate_corridor_links enable row level security;

-- Policies
create policy "Público pode ver corredores climáticos"
  on public.climate_corridors for select
  to anon, authenticated
  using (true);

create policy "Público pode ver links de corredores climáticos"
  on public.climate_corridor_links for select
  to anon, authenticated
  using (true);

-- Restrict mutations to service role
revoke insert, update, delete on public.climate_corridors from anon, authenticated;
revoke insert, update, delete on public.climate_corridor_links from anon, authenticated;

-- Grants
grant select on public.climate_corridors to anon, authenticated;
grant select on public.climate_corridor_links to anon, authenticated;
