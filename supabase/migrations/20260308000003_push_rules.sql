-- Update push_subscriptions with threshold and cooldown rules
alter table public.push_subscriptions 
  add column if not exists pm25_threshold real default 35,
  add column if not exists cooldown_minutes int default 120,
  add column if not exists last_alert_at timestamptz,
  add column if not exists last_alert_pm25 real;

-- Create push_alert_events table for audit/history
create table if not exists public.push_alert_events (
  id uuid primary key default gen_random_uuid(),
  station_id uuid references public.stations(id),
  pm25 real not null,
  fired_at timestamptz default now(),
  reason text,
  created_at timestamptz default now()
);

-- Enable RLS on alert events
alter table public.push_alert_events enable row level security;

-- Policies for push_alert_events
-- Only service_role can interact with alert events
create policy "Service Role full access to alerts"
on public.push_alert_events for all
using ( auth.role() = 'service_role' )
with check ( auth.role() = 'service_role' );
