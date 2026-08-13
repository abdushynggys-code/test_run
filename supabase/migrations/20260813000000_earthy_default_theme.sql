-- Use the new earthy accent for new families and migrate only the untouched old default.
alter table public.family_settings alter column accent_color set default '#a86446';
alter table public.family_members alter column color set default '#a86446';

update public.family_settings
set accent_color = '#a86446', updated_at = now()
where accent_color = '#6157e5';
