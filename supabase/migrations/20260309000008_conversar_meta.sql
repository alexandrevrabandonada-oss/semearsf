-- Add meta column to conversations to support demo tagging and future metadata
alter table public.conversations add column if not exists meta jsonb default '{}'::jsonb;
