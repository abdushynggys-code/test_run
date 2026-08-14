import type { FamilyMember, Todo } from '../../types/family';

export function ChoreProgressPanel({ items, members }: { items: Todo[]; members: FamilyMember[] }) {
  const profiles = members.filter((member) => member.member_type !== 'group');
  const earned = items.filter((item) => item.completed).reduce((total, item) => total + (item.star_value ?? 1), 0);
  const possible = items.reduce((total, item) => total + (item.star_value ?? 1), 0);
  return <section className="bottom-panel progress-panel">
    <header><div><p className="eyebrow">CHORE PROGRESS</p><h2><span>★</span> {earned} stars earned</h2></div><strong>{possible ? Math.round(earned / possible * 100) : 0}%</strong></header>
    <div className="progress-list">{profiles.map((member) => {
      const memberItems = items.filter((item) => item.family_member_id === member.id);
      const stars = memberItems.filter((item) => item.completed).reduce((total, item) => total + (item.star_value ?? 1), 0);
      const total = memberItems.reduce((sum, item) => sum + (item.star_value ?? 1), 0);
      return <article key={member.id}><i style={{ background: member.color }} /><span><strong>{member.name}</strong><small>{stars} of {total} stars</small></span><div><b style={{ width: `${total ? stars / total * 100 : 0}%`, background: member.color }} /></div></article>;
    })}</div>
  </section>;
}
