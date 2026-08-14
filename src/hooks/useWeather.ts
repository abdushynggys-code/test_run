import { useEffect, useState } from 'react';
import { loadWeather, type WeatherSnapshot } from '../lib/weather';

export function useWeather(location: string, unit: 'c' | 'f') {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);

  useEffect(() => {
    let active = true;
    const update = () => void loadWeather(location, unit)
      .then((result) => { if (active) setWeather(result); })
      .catch(() => { if (active) setWeather(null); });
    update();
    const timer = window.setInterval(update, 15 * 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [location, unit]);

  return weather;
}
