-- Replace the old editable olive palettes with one consistent family-display theme.
alter table public.family_settings alter column accent_color set default '#F37748';
alter table public.family_settings alter column palette set default
  '{"primary":"#F37748","dark":"#22314A","light":"#F7F8FA","warm":"#F7B955","deep":"#D95C35"}'::jsonb;
alter table public.family_settings alter column default_view set default 'week';
alter table public.family_members alter column color set default '#F37748';

update public.family_settings
set mode = 'light',
    accent_color = '#F37748',
    palette = '{"primary":"#F37748","dark":"#22314A","light":"#F7F8FA","warm":"#F7B955","deep":"#D95C35"}'::jsonb,
    saved_palettes = '[]'::jsonb,
    default_view = 'week',
    updated_at = now();
