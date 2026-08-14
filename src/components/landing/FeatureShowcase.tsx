import { Reveal } from './Reveal';

const features = [
  { label: 'FAMILY CALENDAR', title: 'The whole week is clear at a glance.', text: 'Profile colors, a live time line, weather, and properly separated overlapping events make busy days readable.', visual: <div className="view-demo"><span>Month</span><span className="active">Week</span><span>Day</span><i /><i /><i /><i /><i /><i /><i /></div> },
  { label: 'GEMINI SIDEKICK', title: 'Plan by typing or speaking naturally.', text: 'Ask about today, create a task, cancel an event, check the weather, or get step-by-step homework help.', visual: <div className="task-demo"><span>✦ “Add science homework tomorrow”</span><span>Ready to review: Add task</span><span>Apply ✓</span></div> },
  { label: 'TASKS & REWARDS', title: 'Give everyone a clear part to play.', text: 'Family task columns show ownership and progress without turning home life into a complicated project tool.', visual: <div className="task-demo"><span>✓ Feed the dog</span><span>○ Pack soccer uniform</span><span>★ 4 stars earned today</span></div> },
];

export function FeatureShowcase() {
  return <section className="feature-showcase">{features.map((feature, index) => <Reveal key={feature.title} direction={index % 2 ? 'left' : 'right'}><article className={index % 2 ? 'reverse' : ''}><div><p className="eyebrow">{feature.label}</p><h2>{feature.title}</h2><p>{feature.text}</p></div><div className="feature-visual">{feature.visual}</div></article></Reveal>)}</section>;
}
