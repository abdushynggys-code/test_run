-- Daily family rewards, first-login help, and private room photos for Sidekick.
alter table public.todos
  add column if not exists completed_at timestamptz;

update public.todos
set completed_at = coalesce(updated_at, created_at)
where completed and completed_at is null;

alter table public.family_settings
  add column if not exists leaderboard_include_adults boolean not null default false,
  add column if not exists tutorial_completed boolean not null default false;

create index if not exists todos_family_completed_idx
  on public.todos(family_id, completed_at)
  where completed;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('room-photos', 'room-photos', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "parents read own room photos"
on storage.objects for select to authenticated
using (bucket_id = 'room-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "parents upload own room photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'room-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "parents delete own room photos"
on storage.objects for delete to authenticated
using (bucket_id = 'room-photos' and (storage.foldername(name))[1] = auth.uid()::text);
