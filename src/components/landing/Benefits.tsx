import { Reveal } from './Reveal';

const benefits = [
  { icon: '▦', title: 'See the whole week', text: 'Everyone’s events, reminders, tasks, and colors stay together.' },
  { icon: '✓', title: 'Build better routines', text: 'Assign chores, track progress, and reward completed work with stars.' },
  { icon: '✦', title: 'Ask your Sidekick', text: 'Create, finish, or cancel plans using normal language or your voice.' },
  { icon: '☀', title: 'Plan around weather', text: 'Live local conditions appear beside your family schedule.' },
  { icon: '↔', title: 'Handle busy schedules', text: 'Overlapping plans stay readable in separate lanes instead of covering each other.' },
  { icon: '⌂', title: 'Made for home', text: 'Large touch targets and clear text work on a kitchen tablet or computer.' },
  { icon: '◫', title: 'Switch views quickly', text: 'Move between Month, Week, Day, and the family task board.' },
  { icon: '●', title: 'Color-coded profiles', text: 'Give every parent, child, or group a recognizable color and photo.' },
];

export function Benefits() {
  return <section className="landing-benefits" id="benefits"><Reveal className="benefits-heading"><p className="eyebrow">WHY FAMILIES USE KINBOARD</p><h2>Less asking. Less forgetting.<br />More time together.</h2></Reveal><div>{benefits.map((item, index) => <Reveal className="benefit-reveal" direction="left" key={item.title} delay={(index % 4) * 135}><article><span>{item.icon}</span><h3>{item.title}</h3><p>{item.text}</p></article></Reveal>)}</div></section>;
}
