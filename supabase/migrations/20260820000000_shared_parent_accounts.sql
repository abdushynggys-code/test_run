-- One family can be shared by multiple authenticated parents on any device.
alter table public.families
  add column if not exists join_code text;

update public.families
set join_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
where join_code is null;

alter table public.families
  alter column join_code set not null,
  alter column join_code set default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

create unique index if not exists families_join_code_key on public.families(join_code);

alter table public.profiles
  add column if not exists active_family_id uuid references public.families(id) on delete set null;

alter table public.family_members
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create unique index if not exists family_members_family_user_key
  on public.family_members(family_id, user_id)
  where user_id is not null;

create table if not exists public.family_accounts (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'parent' check (role in ('owner', 'parent')),
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

insert into public.family_accounts(family_id, user_id, role)
select id, owner_id, 'owner' from public.families
on conflict (family_id, user_id) do update set role = 'owner';

create or replace function public.has_family_access(target_family uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(
    select 1 from public.family_accounts
    where family_id = target_family and user_id = auth.uid()
  )
$$;

create or replace function public.owns_family(target_family uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select public.has_family_access(target_family) $$;

alter table public.family_accounts enable row level security;

drop policy if exists "own family" on public.families;
create policy "family accounts read family" on public.families for select to authenticated
using (public.has_family_access(id));
create policy "family accounts update family" on public.families for update to authenticated
using (public.has_family_access(id)) with check (public.has_family_access(id));

create policy "family accounts read memberships" on public.family_accounts for select to authenticated
using (public.has_family_access(family_id));

drop policy if exists "own family members" on public.family_members;
create policy "family accounts manage profiles" on public.family_members for all to authenticated
using (public.has_family_access(family_id)) with check (public.has_family_access(family_id));

drop policy if exists "own events" on public.events;
create policy "family accounts read events" on public.events for select to authenticated
using (public.has_family_access(family_id));
create policy "family accounts create events" on public.events for insert to authenticated
with check (public.has_family_access(family_id) and created_by = auth.uid());
create policy "family accounts update events" on public.events for update to authenticated
using (public.has_family_access(family_id)) with check (public.has_family_access(family_id));
create policy "family accounts delete events" on public.events for delete to authenticated
using (public.has_family_access(family_id));

drop policy if exists "own reminders" on public.reminders;
create policy "family accounts read reminders" on public.reminders for select to authenticated
using (public.has_family_access(family_id));
create policy "family accounts create reminders" on public.reminders for insert to authenticated
with check (public.has_family_access(family_id) and created_by = auth.uid());
create policy "family accounts update reminders" on public.reminders for update to authenticated
using (public.has_family_access(family_id)) with check (public.has_family_access(family_id));
create policy "family accounts delete reminders" on public.reminders for delete to authenticated
using (public.has_family_access(family_id));

drop policy if exists "own todos" on public.todos;
create policy "family accounts read todos" on public.todos for select to authenticated
using (public.has_family_access(family_id));
create policy "family accounts create todos" on public.todos for insert to authenticated
with check (public.has_family_access(family_id) and created_by = auth.uid());
create policy "family accounts update todos" on public.todos for update to authenticated
using (public.has_family_access(family_id)) with check (public.has_family_access(family_id));
create policy "family accounts delete todos" on public.todos for delete to authenticated
using (public.has_family_access(family_id));

drop policy if exists "own settings" on public.family_settings;
create policy "family accounts manage settings" on public.family_settings for all to authenticated
using (public.has_family_access(family_id)) with check (public.has_family_access(family_id));

update public.profiles
set name = coalesce(nullif(split_part(email, '@', 1), ''), 'parent')
where name is null or btrim(name) = '';

update public.profiles profile
set active_family_id = family.id
from public.families family
where family.owner_id = profile.id and profile.active_family_id is null;

insert into public.family_members(family_id, user_id, name, color, emoji, member_type)
select family.id,
       family.owner_id,
       coalesce(nullif(split_part(profile.email, '@', 1), ''), 'parent'),
       '#F37748',
       upper(left(coalesce(nullif(split_part(profile.email, '@', 1), ''), 'P'), 1)),
       'adult'
from public.families family
join public.profiles profile on profile.id = family.owner_id
on conflict (family_id, user_id) where user_id is not null
do update set active = true;

-- Remove untouched starter profiles, but keep any profile already used by a plan.
delete from public.family_members member
where member.user_id is null
  and member.name in ('Mom', 'Dad', 'Family')
  and not exists (select 1 from public.events where family_member_id = member.id)
  and not exists (select 1 from public.reminders where family_member_id = member.id)
  and not exists (select 1 from public.todos where family_member_id = member.id);

create or replace function public.join_family_by_code(code text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  target_family uuid;
  account_email text;
  account_name text;
begin
  if auth.uid() is null then raise exception 'Sign in before joining a family.'; end if;

  select family.id into target_family
  from public.families family
  where family.join_code = upper(btrim(code));

  if target_family is null then raise exception 'That family code was not found.'; end if;

  select email into account_email from auth.users where id = auth.uid();
  account_name := coalesce(nullif(split_part(account_email, '@', 1), ''), 'parent');

  insert into public.family_accounts(family_id, user_id, role)
  values(target_family, auth.uid(), 'parent')
  on conflict (family_id, user_id) do nothing;

  insert into public.family_members(family_id, user_id, name, color, emoji, member_type)
  values(target_family, auth.uid(), account_name, '#62B6A8', upper(left(account_name, 1)), 'adult')
  on conflict (family_id, user_id) where user_id is not null
  do update set active = true;

  update public.profiles set active_family_id = target_family where id = auth.uid();
  return target_family;
end $$;

revoke all on function public.join_family_by_code(text) from public;
grant execute on function public.join_family_by_code(text) to authenticated;

create or replace function public.rotate_family_join_code(target_family uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare new_code text;
begin
  if not public.has_family_access(target_family) then raise exception 'You cannot change this family code.'; end if;
  loop
    new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    exit when not exists (select 1 from public.families where join_code = new_code);
  end loop;
  update public.families set join_code = new_code, updated_at = now() where id = target_family;
  return new_code;
end $$;

revoke all on function public.rotate_family_join_code(uuid) from public;
grant execute on function public.rotate_family_join_code(uuid) to authenticated;

create or replace function public.create_parent_family()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  new_family uuid;
  account_name text;
begin
  account_name := coalesce(nullif(split_part(new.email, '@', 1), ''), 'parent');
  insert into public.profiles(id, name, email) values(new.id, account_name, new.email);
  insert into public.families(name, owner_id) values('My Family', new.id) returning id into new_family;
  insert into public.family_accounts(family_id, user_id, role) values(new_family, new.id, 'owner');
  insert into public.family_members(family_id, user_id, name, color, emoji, member_type)
  values(new_family, new.id, account_name, '#F37748', upper(left(account_name, 1)), 'adult');
  insert into public.family_settings(family_id) values(new_family);
  update public.profiles set active_family_id = new_family where id = new.id;
  return new;
end $$;

create or replace function public.can_access_family_storage(object_name text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  return public.has_family_access(split_part(object_name, '/', 1)::uuid)
    or exists(
      select 1
      from public.family_accounts uploader
      join public.family_accounts viewer on viewer.family_id = uploader.family_id
      where uploader.user_id = split_part(object_name, '/', 1)::uuid
        and viewer.user_id = auth.uid()
    );
exception when invalid_text_representation then
  return false;
end $$;

create policy "family accounts read shared avatars" on storage.objects for select to authenticated
using (bucket_id = 'family-avatars' and public.can_access_family_storage(name));
create policy "family accounts upload shared avatars" on storage.objects for insert to authenticated
with check (bucket_id = 'family-avatars' and public.can_access_family_storage(name));
create policy "family accounts update shared avatars" on storage.objects for update to authenticated
using (bucket_id = 'family-avatars' and public.can_access_family_storage(name))
with check (bucket_id = 'family-avatars' and public.can_access_family_storage(name));
create policy "family accounts delete shared avatars" on storage.objects for delete to authenticated
using (bucket_id = 'family-avatars' and public.can_access_family_storage(name));

create policy "family accounts read shared room photos" on storage.objects for select to authenticated
using (bucket_id = 'room-photos' and public.can_access_family_storage(name));
create policy "family accounts upload shared room photos" on storage.objects for insert to authenticated
with check (bucket_id = 'room-photos' and public.can_access_family_storage(name));
create policy "family accounts delete shared room photos" on storage.objects for delete to authenticated
using (bucket_id = 'room-photos' and public.can_access_family_storage(name));

-- Keep two devices in sync when either parent changes the shared board.
do $$
declare table_name text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array['family_members', 'events', 'reminders', 'todos', 'family_settings'] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
      ) then
        execute format('alter publication supabase_realtime add table public.%I', table_name);
      end if;
    end loop;
  end if;
end $$;

alter table public.family_members replica identity full;
alter table public.events replica identity full;
alter table public.reminders replica identity full;
alter table public.todos replica identity full;
alter table public.family_settings replica identity full;

-- Reset content without deleting the authenticated parent profiles on a shared board.
create or replace function public.factory_reset_family(target_family uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.has_family_access(target_family) then raise exception 'You cannot reset this family.'; end if;
  delete from public.events where family_id = target_family;
  delete from public.reminders where family_id = target_family;
  delete from public.todos where family_id = target_family;
  delete from public.family_members where family_id = target_family and user_id is null;
  update public.family_members set active = true, level_20_pass_date = null where family_id = target_family;
  update public.families set name = 'My Family', updated_at = now() where id = target_family;
  update public.family_settings set
    mode = 'light', accent_color = '#F37748',
    palette = '{"primary":"#F37748","dark":"#22314A","light":"#F7F8FA","warm":"#F7B955","deep":"#D95C35"}'::jsonb,
    saved_palettes = '[]'::jsonb, default_view = 'week', home_view = 'week', calendar_view = 'month',
    first_day_of_week = 1, temperature_unit = 'c', weather_location = 'Almaty',
    weather_latitude = null, weather_longitude = null, leaderboard_include_adults = false,
    tutorial_completed = false, updated_at = now()
  where family_id = target_family;
end $$;
