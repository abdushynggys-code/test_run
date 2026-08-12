import { useEffect, useState } from 'react';
import type { FamilyMember, FamilySettings } from '../../types/family';

interface Props { familyName: string; members: FamilyMember[]; settings: FamilySettings; isDemo: boolean; onFamily: () => void; onSettings: () => void; }

export function DashboardHeader({ familyName, members, settings, isDemo, onFamily, onSettings }: Props) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30_000); return () => window.clearInterval(timer); }, []);
  const temperature = settings.temperature_unit === 'c' ? '17°' : '63°';

  return (
    <header className="dashboard-header">
      <div className="date-block">
        <span className="brand-mark small">K</span>
        <div><p>{new Intl.DateTimeFormat('en', { weekday: 'long' }).format(now)}</p><strong>{new Intl.DateTimeFormat('en', { month: 'long', day: '2-digit', year: 'numeric' }).format(now)}</strong></div>
        <time>{now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })}</time>
      </div>
      <div className="weather-block" title="Mock weather data until a weather API is connected">
        <span className="weather-icon">☀</span><strong>{temperature}</strong><span>{settings.weather_location}<small>Sunny · H 19° / L 8°</small></span>
      </div>
      <div className="header-actions">
        {isDemo && <span className="demo-badge">Demo</span>}
        <button className="profile-stack" onClick={onFamily} aria-label="Family profiles">
          {members.slice(0, 4).map((member) => <span key={member.id} style={{ background: member.color }}>{member.emoji}</span>)}
        </button>
        <button className="icon-button" onClick={onSettings} aria-label={`${familyName} settings`}>⚙</button>
      </div>
    </header>
  );
}
