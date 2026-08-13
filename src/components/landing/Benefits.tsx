const benefits = [
  { icon: '◫', title: 'See the whole family at a glance', text: 'Events, reminders, and tasks stay together, colored by person.' },
  { icon: '✓', title: 'Turn plans into action', text: 'Assign tasks, track what is done, and keep important reminders visible.' },
  { icon: '⌂', title: 'Made for shared screens', text: 'A calm, touch-friendly dashboard for the kitchen, tablet, or computer.' },
  { icon: '◉', title: 'One parent stays in control', text: 'Manage profiles and family information without creating accounts for kids.' },
];

export function Benefits() {
  return <section className="landing-benefits" id="benefits"><p className="eyebrow">WHY FAMILIES USE KINKEEP</p><h2>Less asking. Less forgetting.<br />More time together.</h2><div>{benefits.map((item) => <article key={item.title}><span>{item.icon}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>;
}
