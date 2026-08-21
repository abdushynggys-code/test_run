-- Remove inherited anonymous RPC access from privileged helpers.
revoke execute on function public.can_access_family_storage(text) from public, anon;
revoke execute on function public.create_parent_family() from public, anon, authenticated;
revoke execute on function public.factory_reset_family(uuid) from public, anon;
revoke execute on function public.has_family_access(uuid) from public, anon;
revoke execute on function public.join_family_by_code(text) from public, anon;
revoke execute on function public.owns_family(uuid) from public, anon;
revoke execute on function public.rotate_family_join_code(uuid) from public, anon;

grant execute on function public.can_access_family_storage(text) to authenticated;
grant execute on function public.factory_reset_family(uuid) to authenticated;
grant execute on function public.has_family_access(uuid) to authenticated;
grant execute on function public.join_family_by_code(text) to authenticated;
grant execute on function public.owns_family(uuid) to authenticated;
grant execute on function public.rotate_family_join_code(uuid) to authenticated;

-- Cache auth.uid() once per statement in the hottest RLS policies.
drop policy if exists "read own entries" on public.entries;
create policy "read own entries" on public.entries for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "insert own entries" on public.entries;
create policy "insert own entries" on public.entries for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "delete own entries" on public.entries;
create policy "delete own entries" on public.entries for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "family accounts create events" on public.events;
create policy "family accounts create events" on public.events for insert to authenticated
with check ((select public.has_family_access(family_id)) and created_by = (select auth.uid()));

drop policy if exists "family accounts create reminders" on public.reminders;
create policy "family accounts create reminders" on public.reminders for insert to authenticated
with check ((select public.has_family_access(family_id)) and created_by = (select auth.uid()));

drop policy if exists "family accounts create todos" on public.todos;
create policy "family accounts create todos" on public.todos for insert to authenticated
with check ((select public.has_family_access(family_id)) and created_by = (select auth.uid()));
