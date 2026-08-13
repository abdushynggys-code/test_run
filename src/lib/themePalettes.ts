import type { ThemePalette } from '../types/family';

export const DEFAULT_PALETTE: ThemePalette = {
  primary: '#7F8A52', dark: '#46512C', light: '#FEFAE0', warm: '#E4B879', deep: '#B97832',
};

export const PALETTE_PRESETS: { name: string; colors: ThemePalette }[] = [
  { name: 'Olive Grove', colors: DEFAULT_PALETTE },
  { name: 'Tropical Sunrise', colors: { primary: '#FF9F1C', dark: '#2EC4B6', light: '#FFFFFF', warm: '#FFBF69', deep: '#CBF3F0' } },
  { name: 'Cool Snow', colors: { primary: '#09BC8A', dark: '#172A3A', light: '#508991', warm: '#74B3CE', deep: '#004346' } },
  { name: 'Vibrant Spring', colors: { primary: '#3C1642', dark: '#086375', light: '#1DD3B0', warm: '#AFFC41', deep: '#B2FF9E' } },
];

export function applyThemePalette(palette: ThemePalette) {
  const root = document.documentElement;
  Object.entries(palette).forEach(([role, color]) => root.style.setProperty(`--palette-${role}`, color));
}

export function getThemePalette(palette?: ThemePalette): ThemePalette {
  return palette && Object.values(palette).every((color) => /^#[0-9a-f]{6}$/i.test(color)) ? palette : DEFAULT_PALETTE;
}
