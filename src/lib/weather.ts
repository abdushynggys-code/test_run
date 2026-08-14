export interface WeatherSnapshot {
  temperature: number;
  high: number;
  low: number;
  label: string;
  icon: string;
  forecast: WeatherDay[];
}

export interface WeatherDay { date: string; high: number; low: number; icon: string }

interface GeocodingResponse { results?: Array<{ latitude: number; longitude: number }> }
interface ForecastResponse {
  current?: { temperature_2m?: number; weather_code?: number };
  daily?: { time?: string[]; weather_code?: number[]; temperature_2m_max?: number[]; temperature_2m_min?: number[] };
}

const weatherLabel = (code: number) => {
  if (code === 0) return ['Clear', '☀️'];
  if (code <= 3) return ['Partly cloudy', '🌤️'];
  if (code <= 48) return ['Foggy', '🌫️'];
  if (code <= 67) return ['Rainy', '🌧️'];
  if (code <= 77) return ['Snowy', '🌨️'];
  if (code <= 82) return ['Showers', '🌦️'];
  return ['Stormy', '⛈️'];
};

export async function loadWeather(location: string, unit: 'c' | 'f'): Promise<WeatherSnapshot> {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en`;
  const geoResponse = await fetch(geoUrl);
  const geo = await geoResponse.json() as GeocodingResponse;
  const place = geo.results?.[0];
  if (!place) throw new Error('Location not found');

  const temperatureUnit = unit === 'f' ? '&temperature_unit=fahrenheit' : '';
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=10&timezone=auto${temperatureUnit}`;
  const forecastResponse = await fetch(forecastUrl);
  const forecast = await forecastResponse.json() as ForecastResponse;
  const current = forecast.current?.temperature_2m;
  const high = forecast.daily?.temperature_2m_max?.[0];
  const low = forecast.daily?.temperature_2m_min?.[0];
  if (current === undefined || high === undefined || low === undefined) throw new Error('Weather unavailable');
  const [label, icon] = weatherLabel(forecast.current?.weather_code ?? 0);
  const days = forecast.daily?.time ?? [];
  const weatherDays = days.map((date, index) => ({
    date,
    high: Math.round(forecast.daily?.temperature_2m_max?.[index] ?? 0),
    low: Math.round(forecast.daily?.temperature_2m_min?.[index] ?? 0),
    icon: weatherLabel(forecast.daily?.weather_code?.[index] ?? 0)[1],
  }));
  return { temperature: Math.round(current), high: Math.round(high), low: Math.round(low), label, icon, forecast: weatherDays };
}
