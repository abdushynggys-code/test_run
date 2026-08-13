import { DEFAULT_PALETTE, PALETTE_PRESETS, getThemePalette } from '../../lib/themePalettes';
import type { ThemePalette } from '../../types/family';

const roles: { key: keyof ThemePalette; label: string }[] = [
  { key: 'primary', label: 'Main' }, { key: 'dark', label: 'Text / dark' },
  { key: 'light', label: 'Background' }, { key: 'warm', label: 'Warm detail' },
  { key: 'deep', label: 'Deep detail' },
];

const samePalette = (first: ThemePalette, second: ThemePalette) =>
  roles.every(({ key }) => first[key].toLowerCase() === second[key].toLowerCase());

export function PaletteEditor({ value, onChange }: { value?: ThemePalette; onChange: (palette: ThemePalette) => void }) {
  const palette = getThemePalette(value ?? DEFAULT_PALETTE);
  return <div className="palette-editor">
    <p>Preset palettes</p>
    <div className="palette-presets">
      {PALETTE_PRESETS.map((preset) => <button type="button" className={samePalette(palette, preset.colors) ? 'active' : ''} key={preset.name} onClick={() => onChange(preset.colors)} aria-label={`Use ${preset.name} palette`}>
        <span>{roles.map(({ key }) => <i key={key} style={{ background: preset.colors[key] }} />)}</span><small>{preset.name}</small>
      </button>)}
    </div>
    <p>Choose your five colors</p>
    <div className="palette-colors">
      {roles.map(({ key, label }) => <label key={key}>{label}<span><input type="color" value={palette[key]} onChange={(event) => onChange({ ...palette, [key]: event.target.value })} /><code>{palette[key].toUpperCase()}</code></span></label>)}
    </div>
  </div>;
}
