-- Reports v3 (biblioteca): kind + featured + indexes
-- Idempotent migration

alter table if exists public.reports
  add column if not exists kind text;

alter table if exists public.reports
  alter column kind set default 'relatorio';

update public.reports
set kind = 'relatorio'
where kind is null;

alter table if exists public.reports
  add column if not exists featured boolean;

alter table if exists public.reports
  alter column featured set default false;

update public.reports
set featured = false
where featured is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reports_kind_check'
      and conrelid = 'public.reports'::regclass
  ) then
    alter table public.reports
      add constraint reports_kind_check
      check (kind in ('relatorio', 'nota-tecnica', 'boletim', 'anexo'));
  end if;
end
$$;

create index if not exists idx_reports_year_kind_featured
  on public.reports (year desc, kind, featured);

create index if not exists idx_reports_featured_published
  on public.reports (featured desc, published_at desc);

create index if not exists idx_reports_kind
  on public.reports (kind);

create index if not exists idx_reports_featured
  on public.reports (featured);

create index if not exists idx_reports_tags
  on public.reports using gin (tags);
