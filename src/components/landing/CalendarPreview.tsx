const plans = [
  { day: 'MON', date: '12', label: 'School drop-off', color: '#51ae78' },
  { day: 'TUE', date: '13', label: 'Soccer practice', color: '#8b6dda' },
  { day: 'WED', date: '14', label: 'Dentist · 4 PM', color: '#ef6f91' },
  { day: 'THU', date: '15', label: 'Family dinner', color: '#28a6a0' },
  { day: 'FRI', date: '16', label: 'Road trip', color: '#4d8ef7' },
];

export function CalendarPreview() {
  return <div className="landing-preview" aria-label="Family calendar preview">
    <header><div><small>FAMILY CALENDAR</small><strong>August 2026</strong></div><span>Today</span></header>
    <div className="preview-grid">{plans.map((plan) => <article key={plan.day}><small>{plan.day}</small><b>{plan.date}</b><i style={{ background: plan.color }} /><span>{plan.label}</span></article>)}</div>
    <footer><span>✓ Buy groceries</span><span>! School meeting tomorrow</span></footer>
  </div>;
}
