-- Create push_subscriptions table
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  user_agent text,
  is_active boolean default true
);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Policies
-- Allow anyone (anon/authenticated) to register a subscription
create policy "Allow public insert"
on public.push_subscriptions for insert
with check ( true );

-- Restrict select/update/delete to service_role (managed via Edge Functions)
create policy "Service Role full access"
on public.push_subscriptions for all
using ( auth.role() = 'service_role' )
with check ( auth.role() = 'service_role' );
