alter table public.family_settings
  add column if not exists weather_latitude double precision,
  add column if not exists weather_longitude double precision;

alter table public.family_settings
  add constraint family_settings_weather_latitude_check
    check (weather_latitude is null or weather_latitude between -90 and 90),
  add constraint family_settings_weather_longitude_check
    check (weather_longitude is null or weather_longitude between -180 and 180);
