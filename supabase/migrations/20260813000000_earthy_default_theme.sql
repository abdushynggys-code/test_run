-- Use the new earthy accent for new families and migrate only the untouched old default.
alter table public.family_settings alter column accent_color set default '#b9785c';
alter table public.family_members alter column color set default '#b9785c';

update public.family_settings
set accent_color = '#b9785c', updated_at = now()
where accent_color in ('#6157e5', '#a86446');
