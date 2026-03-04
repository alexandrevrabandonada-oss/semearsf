-- 1. Create storage bucket "acervo" if not exists
insert into storage.buckets (id, name, public)
values ('acervo', 'acervo', true)
on conflict (id) do nothing;

-- 2. Policies for "acervo" bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'acervo' );

create policy "Service Role Upload"
on storage.objects for insert
with check ( bucket_id = 'acervo' AND auth.role() = 'service_role' );

create policy "Service Role Delete"
on storage.objects for delete
using ( bucket_id = 'acervo' AND auth.role() = 'service_role' );

-- 3. Update acervo_items schema
alter table public.acervo_items 
add column if not exists media jsonb default '[]'::jsonb;
