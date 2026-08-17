-- Atomically restore one owned family board without deleting the parent's account.
create or replace function public.factory_reset_family(target_family uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.owns_family(target_family) then
    raise exception 'You cannot reset this family.';
  end if;

  delete from public.events where family_id = target_family;
  delete from public.reminders where family_id = target_family;
  delete from public.todos where family_id = target_family;
  delete from public.family_members where family_id = target_family;

  insert into public.family_members(family_id, name, color, emoji, member_type)
  values
    (target_family, 'Mom', '#ef6f91', 'M', 'adult'),
    (target_family, 'Dad', '#4d8ef7', 'D', 'adult'),
    (target_family, 'Family', '#28a6a0', 'F', 'group');

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
end;
$$;

revoke all on function public.factory_reset_family(uuid) from public;
grant execute on function public.factory_reset_family(uuid) to authenticated;
