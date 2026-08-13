import { Reveal } from './Reveal';

const features = [
  { label: 'CALENDAR VIEWS', title: 'Zoom out for the month. Focus in on today.', text: 'A compact month overview, seven-day week, and 24-hour timeline help everyone understand what is next.', visual: <div className="view-demo"><span>Month</span><span className="active">Week</span><span>Day</span><i /><i /><i /><i /><i /><i /><i /></div> },
  { label: 'PERSONAL CALENDARS', title: 'One family view, with room for every person.', text: 'Filter the shared calendar or open Emma’s, Dad’s, or a roommate’s calendar. Names, photos, and colors stay connected everywhere.', visual: <div className="profile-demo"><b style={{ background: '#ef6f91' }}>M</b><b style={{ background: '#4d8ef7' }}>D</b><b style={{ background: '#51ae78' }}>E</b><b style={{ background: '#8b6dda' }}>N</b><span>Family Calendar⌄</span></div> },
  { label: 'TASKS & REMINDERS', title: 'Plans do not disappear after they enter the calendar.', text: 'Assign tasks, set due dates, mark work complete, and keep reminders visible without building a complicated project system.', visual: <div className="task-demo"><span>✓ Pay electricity</span><span>□ Pack soccer uniform</span><span>! Dentist · 4:00 PM</span></div> },
];

export function FeatureShowcase() {
  return <section className="feature-showcase">{features.map((feature, index) => <Reveal key={feature.title} direction={index % 2 ? 'left' : 'right'}><article className={index % 2 ? 'reverse' : ''}><div><p className="eyebrow">{feature.label}</p><h2>{feature.title}</h2><p>{feature.text}</p></div><div className="feature-visual">{feature.visual}</div></article></Reveal>)}</section>;
}
