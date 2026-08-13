import type { ThemePalette } from '../types/family';

export const DEFAULT_PALETTE: ThemePalette = {
  primary: '#606C38', dark: '#283618', light: '#FEFAE0', warm: '#DDA15E', deep: '#BC6C25',
};

export const PALETTE_PRESETS: { name: string; colors: ThemePalette }[] = [
  { name: 'Olive Grove', colors: DEFAULT_PALETTE },
  { name: 'Tropical Sunrise', colors: { primary: '#FF9F1C', dark: '#2EC4B6', light: '#FFFFFF', warm: '#FFBF69', deep: '#CBF3F0' } },
  { name: 'Cool Snow', colors: { primary: '#09BC8A', dark: '#172A3A', light: '#74B3CE', warm: '#508991', deep: '#004346' } },
  { name: 'Vibrant Spring', colors: { primary: '#086375', dark: '#3C1642', light: '#B2FF9E', warm: '#AFFC41', deep: '#1DD3B0' } },
];

export function applyThemePalette(palette: ThemePalette) {
  const root = document.documentElement;
  Object.entries(palette).forEach(([role, color]) => root.style.setProperty(`--palette-${role}`, color));
}

export function getThemePalette(palette?: ThemePalette): ThemePalette {
  return palette && Object.values(palette).every((color) => /^#[0-9a-f]{6}$/i.test(color)) ? palette : DEFAULT_PALETTE;
}
