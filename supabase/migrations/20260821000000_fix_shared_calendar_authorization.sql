-- Keep shared calendars fast to find, and reserve destructive controls for the owner.
create index if not exists family_accounts_user_joined_idx
  on public.family_accounts(user_id, joined_at);

grant select on table public.family_accounts to authenticated;

create or replace function public.owns_family(target_family uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1
    from public.family_accounts
    where family_id = target_family
      and user_id = (select auth.uid())
      and role = 'owner'
  )
$$;

drop policy if exists "family accounts update family" on public.families;
create policy "owner updates family"
on public.families for update to authenticated
using ((select public.owns_family(id)))
with check ((select public.owns_family(id)));

create or replace function public.rotate_family_join_code(target_family uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_code text;
begin
  if not public.owns_family(target_family) then
    raise exception 'Only the calendar admin can replace its invite link.';
  end if;

  loop
    new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    exit when not exists (select 1 from public.families where join_code = new_code);
  end loop;

  update public.families
  set join_code = new_code, updated_at = now()
  where id = target_family;
  return new_code;
end
$$;

revoke all on function public.rotate_family_join_code(uuid) from public;
grant execute on function public.rotate_family_join_code(uuid) to authenticated;

create or replace function public.factory_reset_family(target_family uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.owns_family(target_family) then
    raise exception 'Only the calendar admin can reset this calendar.';
  end if;

  delete from public.events where family_id = target_family;
  delete from public.reminders where family_id = target_family;
  delete from public.todos where family_id = target_family;
  delete from public.family_members where family_id = target_family and user_id is null;

  update public.family_members
  set active = true, level_20_pass_date = null
  where family_id = target_family;

  update public.families
  set name = 'My Family', updated_at = now()
  where id = target_family;

  update public.family_settings
  set mode = 'light',
      accent_color = '#F37748',
      palette = '{"primary":"#F37748","dark":"#22314A","light":"#F7F8FA","warm":"#F7B955","deep":"#D95C35"}'::jsonb,
      saved_palettes = '[]'::jsonb,
      default_view = 'week',
      home_view = 'week',
      calendar_view = 'month',
      first_day_of_week = 1,
      temperature_unit = 'c',
      weather_location = 'Almaty',
      weather_latitude = null,
      weather_longitude = null,
      leaderboard_include_adults = false,
      tutorial_completed = false,
      updated_at = now()
  where family_id = target_family;
end
$$;

revoke all on function public.factory_reset_family(uuid) from public;
grant execute on function public.factory_reset_family(uuid) to authenticated;
