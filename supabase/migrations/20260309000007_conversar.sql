-- Create conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body_md text,
  status text not null default 'published',
  created_at timestamptz default now()
);

-- Create conversation_comments table
create table if not exists public.conversation_comments (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  name text not null,
  body text not null,
  created_at timestamptz default now(),
  is_hidden boolean default false
);

-- Indices for performance
create index if not exists idx_conversations_slug on public.conversations(slug);
create index if not exists idx_comments_conversation_id on public.conversation_comments(conversation_id);

-- Enable RLS
alter table public.conversations enable row level security;
alter table public.conversation_comments enable row level security;

-- Conversations Policies
create policy "Público pode ver conversas publicadas"
  on public.conversations for select
  to anon, authenticated
  using (status = 'published');

-- Comments Policies
create policy "Público pode ver comentários não ocultos"
  on public.conversation_comments for select
  to anon, authenticated
  using (is_hidden = false);

create policy "Público pode inserir comentários"
  on public.conversation_comments for insert
  to anon, authenticated
  with check (true);

-- Revoke update/delete from public
revoke update, delete on public.conversations from anon, authenticated;
revoke update, delete on public.conversation_comments from anon, authenticated;

-- Grant access to authenticated/anon
grant select on public.conversations to anon, authenticated;
grant select, insert on public.conversation_comments to anon, authenticated;
