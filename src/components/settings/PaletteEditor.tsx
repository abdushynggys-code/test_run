import { useState } from 'react';
import { DEFAULT_PALETTE, PALETTE_PRESETS, getThemePalette } from '../../lib/themePalettes';
import type { SavedPalette, ThemePalette } from '../../types/family';

const roles: { key: keyof ThemePalette; label: string }[] = [
  { key: 'primary', label: 'Main' }, { key: 'dark', label: 'Text / dark' },
  { key: 'light', label: 'Background' }, { key: 'warm', label: 'Warm detail' },
  { key: 'deep', label: 'Deep detail' },
];

const samePalette = (first: ThemePalette, second: ThemePalette) =>
  roles.every(({ key }) => first[key].toLowerCase() === second[key].toLowerCase());

interface Props {
  value?: ThemePalette;
  saved: SavedPalette[];
  onChange: (palette: ThemePalette) => void;
  onSavedChange: (palettes: SavedPalette[]) => void;
}

export function PaletteEditor({ value, saved, onChange, onSavedChange }: Props) {
  const [name, setName] = useState('');
  const palette = getThemePalette(value ?? DEFAULT_PALETTE);
  const saveCurrent = () => {
    const next = { id: crypto.randomUUID(), name: name.trim() || `My palette ${saved.length + 1}`, colors: palette };
    onSavedChange([...saved, next]); setName('');
  };
  return <div className="palette-editor">
    <p>Olive Grove</p>
    <div className="palette-presets">
      {PALETTE_PRESETS.map((preset) => <PaletteChoice key={preset.name} name={preset.name} colors={preset.colors} active={samePalette(palette, preset.colors)} onChoose={() => onChange(preset.colors)} />)}
      {saved.map((preset) => <PaletteChoice key={preset.id} name={preset.name} colors={preset.colors} active={samePalette(palette, preset.colors)} onChoose={() => onChange(preset.colors)} onRemove={() => onSavedChange(saved.filter((item) => item.id !== preset.id))} />)}
    </div>
    <p>Make your own with five colors</p>
    <div className="palette-colors">
      {roles.map(({ key, label }) => <label key={key}>{label}<span><input type="color" value={palette[key]} onChange={(event) => onChange({ ...palette, [key]: event.target.value })} /><code>{palette[key].toUpperCase()}</code></span></label>)}
    </div>
    <div className="save-palette"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Palette name" maxLength={30} /><button type="button" className="primary-button" onClick={saveCurrent}>Save palette</button></div>
  </div>;
}

function PaletteChoice({ name, colors, active, onChoose, onRemove }: { name: string; colors: ThemePalette; active: boolean; onChoose: () => void; onRemove?: () => void }) {
  return <div className={`palette-choice ${active ? 'active' : ''}`}>
    <button type="button" onClick={onChoose} aria-label={`Use ${name} palette`}><span>{roles.map(({ key }) => <i key={key} style={{ background: colors[key] }} />)}</span><small>{name}</small></button>
    {onRemove && <button type="button" className="remove-palette" onClick={onRemove} aria-label={`Remove ${name}`}>×</button>}
  </div>;
}
