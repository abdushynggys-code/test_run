import type { FamilyMember } from '../../types/family';

interface Props { members: FamilyMember[]; selected: Set<string>; onChange: (selected: Set<string>) => void; }

export function MemberFilters({ members, selected, onChange }: Props) {
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChange(next);
  };
  return (
    <div className="filter-row">
      <span>Show:</span>
      {members.map((member) => <button key={member.id} className={selected.has(member.id) ? 'filter-chip active' : 'filter-chip'} onClick={() => toggle(member.id)}><i style={{ background: member.color }} />{member.name}</button>)}
      <button className="filter-link" onClick={() => onChange(selected.size === members.length ? new Set() : new Set(members.map((member) => member.id)))}>{selected.size === members.length ? 'Clear all' : 'Select all'}</button>
    </div>
  );
}
