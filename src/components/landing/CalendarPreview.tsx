const plans = [
  { day: 'MON', date: '12', label: 'School drop-off', color: '#45A67A' },
  { day: 'TUE', date: '13', label: 'Soccer practice', color: '#8A68D5' },
  { day: 'WED', date: '14', label: 'Dentist · 4 PM', color: '#E05F87' },
  { day: 'THU', date: '15', label: 'Family dinner', color: '#2C9C9A' },
  { day: 'FRI', date: '16', label: 'Road trip', color: '#3C91E6' },
];

export function CalendarPreview() {
  return <div className="landing-preview" aria-label="Family calendar preview">
    <header><div><small>KINBOARD HOME</small><strong>This week</strong></div><span>☀ 18°C</span></header>
    <div className="preview-grid">{plans.map((plan) => <article key={plan.day}><small>{plan.day}</small><b>{plan.date}</b><i style={{ background: plan.color }} /><span>{plan.label}</span></article>)}</div>
    <footer><span>✓ Buy groceries</span><span>✦ Ask Sidekick</span></footer>
  </div>;
}
