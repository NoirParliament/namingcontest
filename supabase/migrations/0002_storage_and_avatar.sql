-- ============================================================================
-- Storage for user uploads (avatars now; brand logos for reports later) +
-- the profiles.avatar_url column that points at the uploaded photo.
-- ============================================================================

alter table profiles add column if not exists avatar_url text;

-- One shared PUBLIC bucket. Files live under the uploader's own {user_id}/…
-- folder; reads are public so the URLs work in <img>, emails, and PDFs.
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Reads: public (so a stored URL renders anywhere).
create policy "uploads_read_all"
  on storage.objects for select to public
  using (bucket_id = 'uploads');

-- Writes: only within your own user-id folder (first path segment).
create policy "uploads_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "uploads_update_own"
  on storage.objects for update to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "uploads_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
