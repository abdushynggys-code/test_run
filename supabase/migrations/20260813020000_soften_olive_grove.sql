-- Soften the original Olive Grove theme while preserving custom family palettes.
alter table public.family_settings alter column palette set default
  '{"primary":"#7F8A52","dark":"#46512C","light":"#FEFAE0","warm":"#E4B879","deep":"#B97832"}'::jsonb;

update public.family_settings
set palette = '{"primary":"#7F8A52","dark":"#46512C","light":"#FEFAE0","warm":"#E4B879","deep":"#B97832"}'::jsonb,
    accent_color = '#7F8A52',
    updated_at = now()
where palette = '{"primary":"#606C38","dark":"#283618","light":"#FEFAE0","warm":"#DDA15E","deep":"#BC6C25"}'::jsonb;
