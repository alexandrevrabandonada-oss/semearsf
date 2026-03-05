-- Migration: reports module (official PDF documents)
-- Idempotent: table + RLS + storage bucket/policies

create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  published_at date,
  year int,
  pdf_url text,
  cover_url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_reports_published_at on public.reports (published_at desc);
create index if not exists idx_reports_year on public.reports (year desc);
create index if not exists idx_reports_tags on public.reports using gin (tags);

alter table public.reports enable row level security;

drop policy if exists reports_select_public on public.reports;
create policy reports_select_public
  on public.reports
  for select
  to anon, authenticated
  using (true);

-- Explicit write policy for service role JWTs (when role exists)
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'drop policy if exists reports_write_service_role on public.reports';
    execute 'create policy reports_write_service_role on public.reports for all to service_role using (true) with check (true)';
  end if;
end
$$;

revoke all on table public.reports from anon, authenticated;
grant select on table public.reports to anon, authenticated;

-- Storage bucket (public download)
insert into storage.buckets (id, name, public)
values ('reports', 'reports', true)
on conflict (id) do update set public = excluded.public;

-- Storage policies (idempotent)
drop policy if exists reports_public_read on storage.objects;
create policy reports_public_read
  on storage.objects
  for select
  to public
  using (bucket_id = 'reports');

drop policy if exists reports_service_role_insert on storage.objects;
create policy reports_service_role_insert
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'reports' and auth.role() = 'service_role');

drop policy if exists reports_service_role_update on storage.objects;
create policy reports_service_role_update
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'reports' and auth.role() = 'service_role')
  with check (bucket_id = 'reports' and auth.role() = 'service_role');

drop policy if exists reports_service_role_delete on storage.objects;
create policy reports_service_role_delete
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'reports' and auth.role() = 'service_role');
