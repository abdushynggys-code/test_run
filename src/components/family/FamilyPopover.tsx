import { useState } from 'react';
import type { CreateMember, FamilyMember } from '../../types/family';

const colors = ['#ef6f91', '#4d8ef7', '#51ae78', '#8b6dda', '#28a6a0', '#ed8b4f'];

export function FamilyPopover({ members, onAdd, onClose }: { members: FamilyMember[]; onAdd: (value: CreateMember) => void; onClose: () => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(colors[0]);
  return <div className="popover family-popover">
    <header><div><p className="eyebrow">PROFILES</p><h3>Family</h3></div><button className="icon-button" onClick={onClose}>×</button></header>
    <div className="family-list">{members.map((member) => <div key={member.id}><span style={{ background: member.color }}>{member.emoji}</span><strong>{member.name}</strong><small>{member.member_type}</small></div>)}</div>
    {adding ? <form className="mini-form" onSubmit={(event) => { event.preventDefault(); onAdd({ name, color, emoji: name.slice(0, 1).toUpperCase(), member_type: 'child' }); setAdding(false); }}>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Profile name" autoFocus required />
      <div className="color-row">{colors.map((item) => <button type="button" className={color === item ? 'active' : ''} style={{ background: item }} key={item} onClick={() => setColor(item)} aria-label={`Use ${item}`} />)}</div>
      <button className="primary-button">Add profile</button>
    </form> : <button className="popover-add" onClick={() => setAdding(true)}>＋ Add profile</button>}
  </div>;
}
