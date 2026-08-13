import type { ThemePalette } from '../types/family';

export const DEFAULT_PALETTE: ThemePalette = {
  primary: '#606C38', dark: '#283618', light: '#FEFAE0', warm: '#DDA15E', deep: '#BC6C25',
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

export function getProfileColors(palette?: ThemePalette): string[] {
  const colors = getThemePalette(palette);
  return [
    colors.primary, colors.deep, colors.warm, colors.dark,
    mixHex(colors.primary, colors.deep), mixHex(colors.primary, colors.warm),
  ];
}

function mixHex(first: string, second: string): string {
  const channels = [1, 3, 5].map((index) => Math.round((parseInt(first.slice(index, index + 2), 16) + parseInt(second.slice(index, index + 2), 16)) / 2));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}
