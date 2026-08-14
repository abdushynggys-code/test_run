-- Reward completed chores with a small, parent-selected number of stars.
alter table public.todos
  add column if not exists star_value smallint not null default 1
  check (star_value between 1 and 5);
