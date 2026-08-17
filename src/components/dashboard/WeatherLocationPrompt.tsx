import { useState } from 'react';
import { getDeviceCoordinates } from '../../lib/geolocation';
import type { FamilySettings } from '../../types/family';

interface Props {
  settings: FamilySettings;
  onSave: (value: Partial<FamilySettings>) => void;
}

export function WeatherLocationPrompt({ settings, onSave }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (dismissed || (settings.weather_latitude !== null && settings.weather_longitude !== null)) return null;

  const locate = async () => {
    setLoading(true); setError('');
    try {
      const coordinates = await getDeviceCoordinates();
      onSave({ weather_location: 'My location', weather_latitude: coordinates.latitude, weather_longitude: coordinates.longitude });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your location could not be found.');
    } finally { setLoading(false); }
  };

  return <section className="weather-location-prompt" aria-label="Local weather setup">
    <span>📍</span><div><strong>Use local weather?</strong><small>{error || 'Allow location once for an accurate forecast where you are.'}</small></div>
    <button className="primary-button" disabled={loading} onClick={() => void locate()}>{loading ? 'Finding…' : 'Use my location'}</button>
    <button className="prompt-dismiss" onClick={() => setDismissed(true)} aria-label="Not now">×</button>
  </section>;
}
