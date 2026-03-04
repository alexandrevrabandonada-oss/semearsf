create extension if not exists pgcrypto;

create table if not exists public.stations (
  id uuid primary key default gen_random_uuid(),
  code text,
  name text not null,
  status text not null default 'offline',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  ts timestamptz not null,
  pm25 numeric,
  pm10 numeric,
  temp numeric,
  humidity numeric,
  quality_flag text,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  capacity integer,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  email text not null,
  whatsapp text,
  bairro text,
  consent_lgpd boolean not null default false,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

alter table public.events
  add column if not exists location text;

alter table public.events
  add column if not exists capacity integer;

alter table public.registrations
  add column if not exists status text;

alter table public.registrations
  alter column status set default 'confirmed';

alter table public.registrations
  alter column consent_lgpd set default false;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'events'
      and column_name = 'location_name'
  ) then
    execute $sql$
      update public.events
      set location = coalesce(location, location_name)
      where location is null
    $sql$;
  end if;
end
$$;

alter table public.stations
  add column if not exists code text;

create unique index if not exists ux_stations_code
  on public.stations (code);

create index if not exists ix_measurements_station_ts
  on public.measurements (station_id, ts desc);

create index if not exists ix_events_start_at
  on public.events (start_at);

create index if not exists ix_registrations_event_id
  on public.registrations (event_id);

alter table public.stations enable row level security;
alter table public.measurements enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;

drop policy if exists stations_select_public on public.stations;
create policy stations_select_public
  on public.stations
  for select
  to anon, authenticated
  using (true);

drop policy if exists measurements_select_public on public.measurements;
create policy measurements_select_public
  on public.measurements
  for select
  to anon, authenticated
  using (true);

drop policy if exists events_select_published on public.events;
create policy events_select_published
  on public.events
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists registrations_insert_public on public.registrations;
create policy registrations_insert_public
  on public.registrations
  for insert
  to anon, authenticated
  with check (true);

revoke all on table public.stations from anon, authenticated;
revoke all on table public.measurements from anon, authenticated;
revoke all on table public.events from anon, authenticated;
revoke all on table public.registrations from anon, authenticated;

grant select on table public.stations to anon, authenticated;
grant select on table public.measurements to anon, authenticated;
grant select on table public.events to anon, authenticated;
grant insert on table public.registrations to anon, authenticated;
