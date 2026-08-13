import type { CalendarView, FamilySettings, ThemeMode } from '../../types/family';
import { supabase } from '../../lib/supabase';

const accents = ['#b9785c', '#87927a', '#b99570', '#738074', '#a77f72', '#c39b62', '#8f6754'];

export function SettingsPanel({ settings, isDemo, onSave, onClose }: { settings: FamilySettings; isDemo: boolean; onSave: (value: Partial<FamilySettings>) => void; onClose: () => void }) {
  return <aside className="settings-panel">
    <header><div><p className="eyebrow">PERSONALIZE</p><h2>Settings</h2></div><button className="icon-button" onClick={onClose}>×</button></header>
    <section><h3>Appearance</h3><label>Display mode<select value={settings.mode} onChange={(event) => onSave({ mode: event.target.value as ThemeMode })}><option value="light">Light</option><option value="dark">Dark</option><option value="auto">Auto</option></select></label><label>Accent color</label><div className="accent-picker">{accents.map((color) => <button className={settings.accent_color === color ? 'active' : ''} style={{ background: color }} key={color} onClick={() => onSave({ accent_color: color })} aria-label={`Use ${color}`} />)}<input type="color" value={settings.accent_color} onChange={(event) => onSave({ accent_color: event.target.value })} aria-label="Custom color" /></div></section>
    <section><h3>Calendar</h3><label>Default view<select value={settings.default_view} onChange={(event) => onSave({ default_view: event.target.value as CalendarView })}><option value="month">Month</option><option value="week">Week</option><option value="day">Day</option></select></label><label>Week starts<select value={settings.first_day_of_week} onChange={(event) => onSave({ first_day_of_week: Number(event.target.value) as 0 | 1 })}><option value="1">Monday</option><option value="0">Sunday</option></select></label></section>
    <section><h3>Weather</h3><label>Location<input value={settings.weather_location} onChange={(event) => onSave({ weather_location: event.target.value })} /></label><label>Temperature<select value={settings.temperature_unit} onChange={(event) => onSave({ temperature_unit: event.target.value as 'c' | 'f' })}><option value="c">Celsius</option><option value="f">Fahrenheit</option></select></label></section>
    {!isDemo && <button className="logout-button" onClick={() => void supabase.auth.signOut()}>Sign out</button>}
    {isDemo && <p className="demo-note">Demo mode saves changes only until this page is refreshed. Connect Supabase to use accounts and permanent storage.</p>}
  </aside>;
}
