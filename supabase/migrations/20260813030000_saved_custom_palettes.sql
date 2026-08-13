-- Let each family name and reuse its own palettes.
alter table public.family_settings
  add column if not exists saved_palettes jsonb not null default '[]'::jsonb;

alter table public.family_settings alter column palette set default
  '{"primary":"#8A704E","dark":"#4E3B2C","light":"#FFF4DE","warm":"#D8B98A","deep":"#76563C"}'::jsonb;

update public.family_settings
set palette = '{"primary":"#8A704E","dark":"#4E3B2C","light":"#FFF4DE","warm":"#D8B98A","deep":"#76563C"}'::jsonb,
    accent_color = '#8A704E', updated_at = now()
where palette = '{"primary":"#7F8A52","dark":"#46512C","light":"#FEFAE0","warm":"#E4B879","deep":"#B97832"}'::jsonb;
