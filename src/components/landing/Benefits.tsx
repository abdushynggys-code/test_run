import { Reveal } from './Reveal';

const benefits = [
  { icon: '◫', title: 'See the whole family at a glance', text: 'Events, reminders, and tasks stay together, colored by person.' },
  { icon: '✓', title: 'Turn plans into action', text: 'Assign tasks, track what is done, and keep important reminders visible.' },
  { icon: '⌂', title: 'Made for shared screens', text: 'A calm, touch-friendly dashboard for the kitchen, tablet, or computer.' },
  { icon: '◉', title: 'One parent stays in control', text: 'Manage profiles and family information without creating accounts for kids.' },
  { icon: '↔', title: 'Plan days or whole weeks', text: 'Create one event or hold and select a range for trips, holidays, and routines.' },
  { icon: '☾', title: 'Make it feel like home', text: 'Choose light or dark mode, an accent color, and a color for every profile.' },
  { icon: '▦', title: 'Switch views instantly', text: 'Move smoothly between Month, Week, and a complete 24-hour Day timeline.' },
  { icon: '◎', title: 'Focus on one person', text: 'Open Family Calendar or a separate calendar for any child, parent, or roommate.' },
];

export function Benefits() {
  return <section className="landing-benefits" id="benefits"><Reveal className="benefits-heading"><p className="eyebrow">WHY FAMILIES USE KINKEEP</p><h2>Less asking. Less forgetting.<br />More time together.</h2></Reveal><div>{benefits.map((item, index) => <Reveal className="benefit-reveal" direction="left" key={item.title} delay={(index % 4) * 135}><article><span>{item.icon}</span><h3>{item.title}</h3><p>{item.text}</p></article></Reveal>)}</div></section>;
}
