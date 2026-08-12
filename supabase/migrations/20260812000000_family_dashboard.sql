-- Family dashboard schema. Apply with: npm run db:push
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Family',
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  avatar_url text,
  color text not null default '#6157e5',
  emoji text not null default 'F',
  member_type text not null default 'adult' check (member_type in ('adult', 'child', 'group')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text not null default '',
  start_time timestamptz not null,
  end_time timestamptz not null,
  all_day boolean not null default false,
  location text not null default '',
  family_member_id uuid references public.family_members(id) on delete set null,
  color text,
  repeat_rule text not null default 'none',
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time >= start_time)
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text not null default '',
  reminder_time timestamptz not null,
  family_member_id uuid references public.family_members(id) on delete set null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  repeat_rule text not null default 'none',
  completed boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text not null default '',
  family_member_id uuid references public.family_members(id) on delete set null,
  due_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  completed boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_settings (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null unique references public.families(id) on delete cascade,
  mode text not null default 'light' check (mode in ('light', 'dark', 'auto')),
  accent_color text not null default '#6157e5',
  default_view text not null default 'month' check (default_view in ('month', 'week', 'day')),
  first_day_of_week smallint not null default 1 check (first_day_of_week in (0, 1)),
  temperature_unit text not null default 'c' check (temperature_unit in ('c', 'f')),
  weather_location text not null default 'Almaty',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.owns_family(target_family uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.families where id = target_family and owner_id = auth.uid()) $$;

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.events enable row level security;
alter table public.reminders enable row level security;
alter table public.todos enable row level security;
alter table public.family_settings enable row level security;

create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own family" on public.families for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own family members" on public.family_members for all using (public.owns_family(family_id)) with check (public.owns_family(family_id));
create policy "own events" on public.events for all using (public.owns_family(family_id)) with check (public.owns_family(family_id) and created_by = auth.uid());
create policy "own reminders" on public.reminders for all using (public.owns_family(family_id)) with check (public.owns_family(family_id) and created_by = auth.uid());
create policy "own todos" on public.todos for all using (public.owns_family(family_id)) with check (public.owns_family(family_id) and created_by = auth.uid());
create policy "own settings" on public.family_settings for all using (public.owns_family(family_id)) with check (public.owns_family(family_id));

create or replace function public.create_parent_family()
returns trigger language plpgsql security definer set search_path = '' as $$
declare new_family uuid;
begin
  insert into public.profiles(id, email) values(new.id, new.email);
  insert into public.families(name, owner_id) values('My Family', new.id) returning id into new_family;
  insert into public.family_members(family_id, name, color, emoji, member_type) values
    (new_family, 'Mom', '#ef6f91', 'M', 'adult'),
    (new_family, 'Dad', '#4d8ef7', 'D', 'adult'),
    (new_family, 'Family', '#28a6a0', 'F', 'group');
  insert into public.family_settings(family_id) values(new_family);
  return new;
end $$;

drop trigger if exists on_parent_created on auth.users;
create trigger on_parent_created after insert on auth.users
for each row execute function public.create_parent_family();

-- Give accounts created before this migration the same safe starting data.
insert into public.profiles(id, email)
select id, email from auth.users on conflict (id) do nothing;

insert into public.families(name, owner_id)
select 'My Family', id from auth.users on conflict (owner_id) do nothing;

insert into public.family_settings(family_id)
select id from public.families on conflict (family_id) do nothing;

insert into public.family_members(family_id, name, color, emoji, member_type)
select family.id, defaults.name, defaults.color, defaults.emoji, defaults.member_type
from public.families family
cross join (values
  ('Mom', '#ef6f91', 'M', 'adult'),
  ('Dad', '#4d8ef7', 'D', 'adult'),
  ('Family', '#28a6a0', 'F', 'group')
) as defaults(name, color, emoji, member_type)
where not exists (select 1 from public.family_members member where member.family_id = family.id);

create index events_family_start_idx on public.events(family_id, start_time);
create index reminders_family_time_idx on public.reminders(family_id, reminder_time);
create index todos_family_due_idx on public.todos(family_id, due_date);
