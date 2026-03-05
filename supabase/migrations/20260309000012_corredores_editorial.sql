-- Add editorial fields to climate_corridors
-- Idempotent: safe to run multiple times

-- Add cover_url column
alter table public.climate_corridors 
  add column if not exists cover_url text;

-- Add note_md column (editorial notes/description)
alter table public.climate_corridors 
  add column if not exists note_md text;

-- Add position column for manual ordering
alter table public.climate_corridors 
  add column if not exists position int default 0;

-- Add index for position ordering
create index if not exists idx_climate_corridors_position 
  on public.climate_corridors(position desc);

-- Update featured default if needed (already exists in base migration)
-- This is a no-op but ensures consistency
alter table public.climate_corridors 
  alter column featured set default false;
