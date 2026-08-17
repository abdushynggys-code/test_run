-- A level-20 child earns one task-free day. Keeping the date also prevents repeat claims.
alter table public.family_members
add column if not exists level_20_pass_date date;
