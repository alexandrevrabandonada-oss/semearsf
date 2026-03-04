-- Create share_events table for social analytics
create table if not exists public.share_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('acervo', 'blog')),
  slug text not null,
  occurred_at timestamptz default now(),
  referrer text,
  user_agent text,
  ip_hash text,
  meta jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.share_events enable row level security;

-- Index for performance (7 day lookups and top slugs)
create index if not exists idx_share_events_occurred_at on public.share_events(occurred_at);
create index if not exists idx_share_events_kind_slug on public.share_events(kind, slug);

-- RLS Policies
-- Only service_role can interact with share events
create policy "Service Role full access to share_events"
on public.share_events for all
using ( auth.role() = 'service_role' )
with check ( auth.role() = 'service_role' );

-- RPC to aggregate top shared items
create or replace function public.get_top_shared_items(p_days int default 7)
returns table (kind text, slug text, count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    se.kind, 
    se.slug, 
    count(*)::bigint
  from share_events se
  where se.occurred_at >= now() - (p_days || ' days')::interval
  group by se.kind, se.slug
  order by count(*) desc
  limit 5;
end;
$$;

grant execute on function public.get_top_shared_items(int) to anon, authenticated, service_role;
