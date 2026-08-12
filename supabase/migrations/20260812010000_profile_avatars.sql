-- Private profile images. Paths start with the authenticated parent's user id.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('family-avatars', 'family-avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "parents read own family avatars"
on storage.objects for select to authenticated
using (bucket_id = 'family-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "parents upload own family avatars"
on storage.objects for insert to authenticated
with check (bucket_id = 'family-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "parents update own family avatars"
on storage.objects for update to authenticated
using (bucket_id = 'family-avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'family-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "parents delete own family avatars"
on storage.objects for delete to authenticated
using (bucket_id = 'family-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
