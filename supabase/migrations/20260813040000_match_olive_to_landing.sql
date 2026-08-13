-- Match Olive Grove to the landing page; brown remains a supporting accent.
alter table public.family_settings alter column palette set default
  '{"primary":"#606C38","dark":"#283618","light":"#FEFAE0","warm":"#DDA15E","deep":"#BC6C25"}'::jsonb;

update public.family_settings
set palette = '{"primary":"#606C38","dark":"#283618","light":"#FEFAE0","warm":"#DDA15E","deep":"#BC6C25"}'::jsonb,
    accent_color = '#606C38', updated_at = now()
where palette = '{"primary":"#8A704E","dark":"#4E3B2C","light":"#FFF4DE","warm":"#D8B98A","deep":"#76563C"}'::jsonb;
