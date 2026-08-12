import { useEffect, useRef, useState } from 'react';
import type { FamilyMember } from '../../types/family';

interface Props { members: FamilyMember[]; selectedId: string | null; onChange: (id: string | null) => void; }
export function CalendarPicker({ members, selectedId, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const selected = members.find((member) => member.id === selectedId);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  function choose(id: string | null) { onChange(id); setOpen(false); }
  return <div className="calendar-picker" ref={root}>
    <button className={open ? 'calendar-picker-button open' : 'calendar-picker-button'} onClick={() => setOpen(!open)} aria-expanded={open}>
      <span className="picker-avatar family-icon">⌂</span><strong>{selected ? `${selected.name}’s Calendar` : 'Family Calendar'}</strong><i>⌄</i>
    </button>
    <div className={open ? 'calendar-picker-menu open' : 'calendar-picker-menu'}>
      <button className={!selectedId ? 'active' : ''} onClick={() => choose(null)}><span className="picker-avatar family-icon">⌂</span><span><strong>Family Calendar</strong><small>Everyone’s plans</small></span>{!selectedId && <b>✓</b>}</button>
      {members.map((member) => <button className={selectedId === member.id ? 'active' : ''} key={member.id} onClick={() => choose(member.id)}><span className="picker-avatar" style={{ background: member.color }}>{member.avatar_url ? <img src={member.avatar_url} alt="" /> : member.emoji}</span><span><strong>{member.name}’s Calendar</strong><small>Events, tasks & reminders</small></span>{selectedId === member.id && <b>✓</b>}</button>)}
    </div>
  </div>;
}
