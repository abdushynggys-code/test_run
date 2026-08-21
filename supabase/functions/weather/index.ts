const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherCondition { id?: number; main?: string }
interface DailyWeather {
  dt?: number;
  temp?: { min?: number; max?: number };
  weather?: WeatherCondition[];
}
interface OneCallResponse {
  timezone_offset?: number;
  current?: { temp?: number; weather?: WeatherCondition[] };
  daily?: DailyWeather[];
}
interface Coordinates { latitude: number; longitude: number }

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function configuredKeys() {
  const keys: string[] = [];
  const raw = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      keys.push(...Object.values(parsed).filter((value): value is string => typeof value === 'string'));
    } catch { /* Fall back to the legacy key below. */ }
  }
  const legacyKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (legacyKey) keys.push(legacyKey);
  return keys;
}

function hasProjectKey(request: Request) {
  const key = request.headers.get('apikey');
  return Boolean(key && configuredKeys().includes(key));
}

function isCoordinates(latitude: unknown, longitude: unknown): latitude is number {
  return typeof latitude === 'number' && Number.isFinite(latitude)
    && typeof longitude === 'number' && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

async function findCoordinates(location: string): Promise<Coordinates | null> {
  const url = new URL('https://api.openweathermap.org/geo/1.0/direct');
  url.searchParams.set('q', location);
  url.searchParams.set('limit', '1');
  url.searchParams.set('appid', OPENWEATHER_API_KEY ?? '');
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`geocoding:${response.status}`);
  const result = await response.json() as Array<{ lat?: unknown; lon?: unknown }>;
  const first = result[0];
  return first && isCoordinates(first.lat, first.lon)
    ? { latitude: first.lat, longitude: first.lon as number }
    : null;
}

function weatherIcon(id = 800) {
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '🌨️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800) return '☀️';
  return '🌥️';
}

function dateAtLocation(timestamp: number, offset: number) {
  return new Date((timestamp + offset) * 1_000).toISOString().slice(0, 10);
}

async function loadForecast(coordinates: Coordinates, unit: 'c' | 'f') {
  const url = new URL('https://api.openweathermap.org/data/3.0/onecall');
  url.searchParams.set('lat', String(coordinates.latitude));
  url.searchParams.set('lon', String(coordinates.longitude));
  url.searchParams.set('units', unit === 'f' ? 'imperial' : 'metric');
  url.searchParams.set('exclude', 'minutely,hourly,alerts');
  url.searchParams.set('appid', OPENWEATHER_API_KEY ?? '');
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`forecast:${response.status}`);
  return response.json() as Promise<OneCallResponse>;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Use a POST request.' }, 405);
  if (!hasProjectKey(request)) return json({ error: 'Unauthorized.' }, 401);
  if (!OPENWEATHER_API_KEY) return json({ error: 'OpenWeather is not configured.' }, 503);

  try {
    const body = await request.json() as Record<string, unknown>;
    const unit = body.unit === 'f' ? 'f' : body.unit === 'c' ? 'c' : null;
    if (!unit) return json({ error: 'Choose Celsius or Fahrenheit.' }, 400);

    let coordinates: Coordinates | null = null;
    if (isCoordinates(body.latitude, body.longitude)) {
      coordinates = { latitude: body.latitude, longitude: body.longitude as number };
    } else {
      const location = typeof body.location === 'string' ? body.location.trim() : '';
      if (!location || location.length > 120) return json({ error: 'Enter a valid location.' }, 400);
      coordinates = await findCoordinates(location);
    }
    if (!coordinates) return json({ error: 'Location not found.' }, 404);

    const forecast = await loadForecast(coordinates, unit);
    const current = forecast.current;
    const today = forecast.daily?.[0];
    if (current?.temp === undefined || today?.temp?.max === undefined || today.temp.min === undefined) {
      return json({ error: 'OpenWeather returned incomplete weather data.' }, 502);
    }
    const offset = forecast.timezone_offset ?? 0;
    const days = (forecast.daily ?? []).flatMap((day) => (
      day.dt !== undefined && day.temp?.max !== undefined && day.temp.min !== undefined
        ? [{ date: dateAtLocation(day.dt, offset), high: Math.round(day.temp.max), low: Math.round(day.temp.min), icon: weatherIcon(day.weather?.[0]?.id) }]
        : []
    ));
    return json({
      temperature: Math.round(current.temp),
      high: Math.round(today.temp.max),
      low: Math.round(today.temp.min),
      label: current.weather?.[0]?.main ?? 'Weather',
      icon: weatherIcon(current.weather?.[0]?.id),
      forecast: days,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const safeReason = /^(geocoding|forecast):\d{3}$/.test(message) ? message : 'network-or-response-error';
    console.error('OpenWeather request failed', safeReason);
    if (message.endsWith(':401')) return json({ error: 'The OpenWeather key is invalid or not active yet.' }, 502);
    if (message.endsWith(':402')) return json({ error: 'Enable the One Call by Call plan for this OpenWeather key.' }, 502);
    if (message.endsWith(':429')) return json({ error: 'The OpenWeather daily limit has been reached.' }, 503);
    return json({ error: 'Could not reach OpenWeather. Please try again.' }, 502);
  }
});
