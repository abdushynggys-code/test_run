import { useEffect, useState } from 'react';
import type { FamilyMember, FamilySettings } from '../../types/family';
import type { WeatherSnapshot } from '../../lib/weather';

interface Props {
  familyName: string;
  members: FamilyMember[];
  settings: FamilySettings;
  weather: WeatherSnapshot | null;
  isDemo: boolean;
  onFamily: () => void;
  onSidekick: () => void;
  winnerIds: Set<string>;
}

export function DashboardHeader({ familyName, members, settings, weather, isDemo, onFamily, onSidekick, winnerIds }: Props) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const degree = settings.temperature_unit === 'c' ? '°C' : '°F';

  return <header className="dashboard-header">
    <div className="date-block">
      <div><p>{new Intl.DateTimeFormat('en', { weekday: 'long' }).format(now)}</p><strong>{new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(now)}</strong></div>
      <time>{now.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</time>
    </div>
    <div className="weather-block">
      <span className="weather-icon">{weather?.icon ?? '◌'}</span>
      <strong>{weather ? `${weather.temperature}${degree}` : '--'}</strong>
      <span>{settings.weather_location}<small>{weather ? `${weather.label} · H ${weather.high}° / L ${weather.low}°` : 'Loading weather…'}</small></span>
    </div>
    <div className="header-actions">
      {isDemo && <span className="demo-badge">Demo</span>}
      <button className="sidekick-header-button" onClick={onSidekick}><span>✦</span> Ask Sidekick</button>
      <button className="profile-stack" onClick={onFamily} aria-label={`${familyName} profiles`}>
        {[...members].sort((left, right) => Number(winnerIds.has(right.id)) - Number(winnerIds.has(left.id))).slice(0, 4).map((member) => <span className={winnerIds.has(member.id) ? 'crowned' : ''} key={member.id} style={{ background: member.color }}>{member.avatar_url ? <img src={member.avatar_url} alt="" /> : member.emoji}</span>)}
      </button>
    </div>
  </header>;
}
