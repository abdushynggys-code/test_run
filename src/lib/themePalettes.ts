import type { ThemePalette } from '../types/family';

export const DEFAULT_PALETTE: ThemePalette = {
  primary: '#606C38', dark: '#283618', light: '#FEFAE0', warm: '#DDA15E', deep: '#BC6C25',
};

export const PALETTE_PRESETS: { name: string; colors: ThemePalette }[] = [
  { name: 'Olive Grove', colors: DEFAULT_PALETTE },
  { name: 'Sage Linen', colors: { primary: '#7A8450', dark: '#34422A', light: '#F3EFD9', warm: '#C9A66B', deep: '#9B6545' } },
  { name: 'Cozy Clay', colors: { primary: '#7B6846', dark: '#3C3025', light: '#F2E7D5', warm: '#C98F65', deep: '#9D553A' } },
  { name: 'Forest Moss', colors: { primary: '#4F633D', dark: '#1F3326', light: '#E8E6CF', warm: '#B99461', deep: '#8B5E34' } },
];

export function applyThemePalette(palette: ThemePalette) {
  const root = document.documentElement;
  Object.entries(palette).forEach(([role, color]) => root.style.setProperty(`--palette-${role}`, color));
}

export function getThemePalette(palette?: ThemePalette): ThemePalette {
  return palette && Object.values(palette).every((color) => /^#[0-9a-f]{6}$/i.test(color)) ? palette : DEFAULT_PALETTE;
}
