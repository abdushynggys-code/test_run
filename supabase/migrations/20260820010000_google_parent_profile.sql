-- New families start with one real parent profile populated from the auth provider.
create or replace function public.create_parent_family()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  new_family uuid;
  account_name text;
  account_avatar text;
begin
  account_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(new.email, '@', 1), ''),
    'parent'
  );
  account_avatar := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'picture'), '')
  );

  insert into public.profiles(id, name, email, avatar_url)
  values(new.id, account_name, new.email, account_avatar);
  insert into public.families(name, owner_id)
  values('My Family', new.id) returning id into new_family;
  insert into public.family_accounts(family_id, user_id, role)
  values(new_family, new.id, 'owner');
  insert into public.family_members(family_id, user_id, name, avatar_url, color, emoji, member_type)
  values(new_family, new.id, account_name, account_avatar, '#F37748', upper(left(account_name, 1)), 'adult');
  insert into public.family_settings(family_id) values(new_family);
  update public.profiles set active_family_id = new_family where id = new.id;
  return new;
end $$;

-- Bring existing authenticated parent rows in sync with their Google display profile.
update public.profiles profile
set name = coalesce(
      nullif(btrim(account.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(account.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(account.email, '@', 1), ''),
      'parent'
    ),
    avatar_url = coalesce(
      nullif(btrim(account.raw_user_meta_data ->> 'avatar_url'), ''),
      nullif(btrim(account.raw_user_meta_data ->> 'picture'), ''),
      profile.avatar_url
    )
from auth.users account
where profile.id = account.id;

update public.family_members member
set name = coalesce(
      nullif(btrim(account.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(account.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(account.email, '@', 1), ''),
      'parent'
    ),
    avatar_url = coalesce(
      nullif(btrim(account.raw_user_meta_data ->> 'avatar_url'), ''),
      nullif(btrim(account.raw_user_meta_data ->> 'picture'), ''),
      member.avatar_url
    ),
    emoji = upper(left(coalesce(
      nullif(btrim(account.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(account.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(account.email, '@', 1), ''),
      'P'
    ), 1)),
    active = true
from auth.users account
where member.user_id = account.id;

-- Remove only unused legacy starter rows; user-created or assigned profiles stay intact.
delete from public.family_members member
where member.user_id is null
  and member.name in ('Mom', 'Dad', 'Family')
  and not exists (select 1 from public.events where family_member_id = member.id)
  and not exists (select 1 from public.reminders where family_member_id = member.id)
  and not exists (select 1 from public.todos where family_member_id = member.id);
