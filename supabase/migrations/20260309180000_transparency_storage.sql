-- Transparency v4: storage bucket + public download + service-role upload
-- Idempotent migration

insert into storage.buckets (id, name, public)
values ('transparency', 'transparency', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists transparency_public_read on storage.objects;
create policy transparency_public_read
  on storage.objects
  for select
  to public
  using (bucket_id = 'transparency');

drop policy if exists transparency_service_role_insert on storage.objects;
create policy transparency_service_role_insert
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'transparency' and auth.role() = 'service_role');

drop policy if exists transparency_service_role_update on storage.objects;
create policy transparency_service_role_update
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'transparency' and auth.role() = 'service_role')
  with check (bucket_id = 'transparency' and auth.role() = 'service_role');

drop policy if exists transparency_service_role_delete on storage.objects;
create policy transparency_service_role_delete
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'transparency' and auth.role() = 'service_role');
