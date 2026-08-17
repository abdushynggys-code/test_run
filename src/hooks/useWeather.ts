import { useEffect, useState } from 'react';
import { loadWeather, type WeatherSnapshot } from '../lib/weather';

export function useWeather(location: string, unit: 'c' | 'f', latitude: number | null, longitude: number | null) {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);

  useEffect(() => {
    let active = true;
    const coordinates = latitude !== null && longitude !== null ? { latitude, longitude } : undefined;
    const update = () => void loadWeather(location, unit, coordinates)
      .then((result) => { if (active) setWeather(result); })
      .catch(() => { if (active) setWeather(null); });
    update();
    const timer = window.setInterval(update, 15 * 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [latitude, location, longitude, unit]);

  return weather;
}
