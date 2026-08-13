import type { ThemePalette } from '../types/family';

export const DEFAULT_PALETTE: ThemePalette = {
  primary: '#8A704E', dark: '#4E3B2C', light: '#FFF4DE', warm: '#D8B98A', deep: '#76563C',
};

export const PALETTE_PRESETS: { name: string; colors: ThemePalette }[] = [
  { name: 'Olive Grove', colors: DEFAULT_PALETTE },
];

export function applyThemePalette(palette: ThemePalette) {
  const root = document.documentElement;
  Object.entries(palette).forEach(([role, color]) => root.style.setProperty(`--palette-${role}`, color));
}

export function getThemePalette(palette?: ThemePalette): ThemePalette {
  return palette && Object.values(palette).every((color) => /^#[0-9a-f]{6}$/i.test(color)) ? palette : DEFAULT_PALETTE;
}
