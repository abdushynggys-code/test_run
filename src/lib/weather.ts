import { supabase } from './supabase';

export interface WeatherSnapshot {
  temperature: number;
  high: number;
  low: number;
  label: string;
  icon: string;
  forecast: WeatherDay[];
}

export interface WeatherDay {
  date: string;
  high: number;
  low: number;
  icon: string;
}

export interface WeatherCoordinates {
  latitude: number;
  longitude: number;
}

function isWeatherDay(value: unknown): value is WeatherDay {
  if (!value || typeof value !== 'object') return false;
  const day = value as Partial<WeatherDay>;
  return typeof day.date === 'string'
    && typeof day.high === 'number'
    && typeof day.low === 'number'
    && typeof day.icon === 'string';
}

function isWeatherSnapshot(value: unknown): value is WeatherSnapshot {
  if (!value || typeof value !== 'object') return false;
  const weather = value as Partial<WeatherSnapshot>;
  return typeof weather.temperature === 'number'
    && typeof weather.high === 'number'
    && typeof weather.low === 'number'
    && typeof weather.label === 'string'
    && typeof weather.icon === 'string'
    && Array.isArray(weather.forecast)
    && weather.forecast.every(isWeatherDay);
}

export async function loadWeather(
  location: string,
  unit: 'c' | 'f',
  coordinates?: WeatherCoordinates,
): Promise<WeatherSnapshot> {
  const { data, error } = await supabase.functions.invoke<unknown>('weather', {
    body: {
      location,
      unit,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    },
  });

  if (error) throw new Error('Weather is temporarily unavailable.');
  if (!isWeatherSnapshot(data)) throw new Error('OpenWeather returned an unexpected response.');
  return data;
}
