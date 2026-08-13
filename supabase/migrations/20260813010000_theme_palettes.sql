-- Store all five theme roles together so each family can build a complete palette.
alter table public.family_settings
  add column if not exists palette jsonb not null default '{"primary":"#606C38","dark":"#283618","light":"#FEFAE0","warm":"#DDA15E","deep":"#BC6C25"}'::jsonb;

alter table public.family_settings alter column accent_color set default '#606C38';
alter table public.family_members alter column color set default '#606C38';

update public.family_settings
set accent_color = '#606C38', updated_at = now()
where accent_color = '#78866b';
