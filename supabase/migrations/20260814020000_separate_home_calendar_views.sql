alter table public.family_settings
  add column if not exists home_view text not null default 'week'
    check (home_view in ('month', 'week', 'day')),
  add column if not exists calendar_view text not null default 'month'
    check (calendar_view in ('month', 'week', 'day'));

update public.family_settings
set home_view = 'week', calendar_view = 'month';
