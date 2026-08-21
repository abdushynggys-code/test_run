import { useState } from 'react';
import type { CalendarView, FamilySettings } from '../../types/family';
import { supabase } from '../../lib/supabase';
import { getDeviceCoordinates } from '../../lib/geolocation';
import { FactoryResetControl } from './FactoryResetControl';

interface Props {
  settings: FamilySettings;
  isDemo: boolean;
  isOwner: boolean;
  onSave: (value: Partial<FamilySettings>) => void;
  onClose: () => void;
  onTutorial: () => void;
  onFactoryReset: () => Promise<void>;
}

export function SettingsPanel({ settings, isDemo, isOwner, onSave, onClose, onTutorial, onFactoryReset }: Props) {
  const [location, setLocation] = useState(settings.weather_location);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const useCurrentLocation = async () => {
    setLocating(true); setLocationMessage('');
    try {
      const coordinates = await getDeviceCoordinates();
      setLocation('My location');
      onSave({ weather_location: 'My location', weather_latitude: coordinates.latitude, weather_longitude: coordinates.longitude });
      setLocationMessage('Using your device location for weather.');
    } catch (reason) {
      setLocationMessage(reason instanceof Error ? reason.message : 'Your location could not be found.');
    } finally { setLocating(false); }
  };
  const saveManualLocation = () => {
    const next = location.trim();
    if (next && next !== settings.weather_location) onSave({ weather_location: next, weather_latitude: null, weather_longitude: null });
  };
  return <aside className="settings-panel">
    <header><div><p className="eyebrow">KINBOARD</p><h2>Settings</h2></div><button className="icon-button" onClick={onClose} aria-label="Close settings">×</button></header>
    <section><h3>Calendar</h3>
      <label>Default view<select value={settings.calendar_view} onChange={(event) => onSave({ calendar_view: event.target.value as CalendarView })}><option value="month">Month</option><option value="week">Week</option><option value="day">Day</option></select></label>
      <label>Week starts<select value={settings.first_day_of_week} onChange={(event) => onSave({ first_day_of_week: Number(event.target.value) as 0 | 1 })}><option value="1">Monday</option><option value="0">Sunday</option></select></label>
    </section>
    <section><h3>Weather</h3>
      <label>Location<input value={location} onChange={(event) => setLocation(event.target.value)} onBlur={saveManualLocation} /></label>
      <button className="location-button" disabled={locating} onClick={() => void useCurrentLocation()}>📍 {locating ? 'Finding your location…' : 'Use my current location'}</button>
      {locationMessage && <p className="location-message">{locationMessage}</p>}
      <label>Temperature<select value={settings.temperature_unit} onChange={(event) => onSave({ temperature_unit: event.target.value as 'c' | 'f' })}><option value="c">Celsius</option><option value="f">Fahrenheit</option></select></label>
    </section>
    <section><h3>Stars & leaderboard</h3>
      <label className="settings-switch"><span><strong>Include parents</strong><small>Off keeps the daily challenge just for children.</small></span><input type="checkbox" checked={settings.leaderboard_include_adults} onChange={(event) => onSave({ leaderboard_include_adults: event.target.checked })} /></label>
    </section>
    <section><h3>Help</h3><button className="location-button" onClick={onTutorial}>Show the quick tutorial again</button></section>
    <section className="settings-about"><h3>Display style</h3><p>Kinboard uses one calm, high-contrast family display theme so it is easy to read from across the room.</p><p><a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather data by Open-Meteo</a></p></section>
    <section className="settings-danger"><h3>Danger zone</h3>{isOwner ? <><p>Return Kinboard to its original empty setup.</p><FactoryResetControl isDemo={isDemo} onReset={onFactoryReset} /></> : <p>Only the calendar admin can erase and reset this shared calendar.</p>}</section>
    {!isDemo && <button className="logout-button" onClick={() => void supabase.auth.signOut()}>Sign out</button>}
    {isDemo && <p className="demo-note">Demo changes reset when this page refreshes.</p>}
  </aside>;
}
