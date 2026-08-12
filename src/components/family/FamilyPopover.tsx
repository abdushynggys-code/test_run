import { useState } from 'react';
import type { CreateMember, FamilyMember } from '../../types/family';

const colors = ['#ef6f91', '#4d8ef7', '#51ae78', '#8b6dda', '#28a6a0', '#ed8b4f'];
interface Props { members: FamilyMember[]; onAdd: (value: CreateMember, file?: File) => void; onAvatar: (id: string, file: File) => void; onColor: (id: string, color: string) => void; onName: (id: string, name: string) => void; onRemove: (id: string) => void; onClose: () => void; }

export function FamilyPopover({ members, onAdd, onAvatar, onColor, onName, onRemove, onClose }: Props) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(colors[0]);
  const [photo, setPhoto] = useState<File>();

  return <div className="popover family-popover">
    <header><div><p className="eyebrow">PROFILES</p><h3>Family</h3></div><button className="icon-button" onClick={onClose}>×</button></header>
    <div className="family-scroll"><div className="family-list">{members.map((member) => <div className="profile-row" key={member.id}>
      <span className="profile-avatar" style={{ background: member.color }}>{member.avatar_url ? <img src={member.avatar_url} alt={`${member.name} profile`} /> : member.emoji}</span>
      <strong>{member.name}<small>{member.member_type}</small></strong>
      <button className="change-profile" onClick={() => setEditingId(editingId === member.id ? null : member.id)}>Change</button>
      {editingId === member.id && <div className="profile-editor">
        <label>Profile name<input defaultValue={member.name} onBlur={(event) => { const nextName = event.target.value.trim(); if (nextName && nextName !== member.name) onName(member.id, nextName); }} /></label>
        <div><label>Profile color</label><div className="edit-colors">{colors.map((item) => <button type="button" className={member.color === item ? 'active' : ''} style={{ background: item }} key={item} onClick={() => onColor(member.id, item)} aria-label={`Use ${item}`} />)}<label className="color-wheel" title="Choose any color"><input type="color" value={member.color} onChange={(event) => onColor(member.id, event.target.value)} /><span>＋</span></label></div></div>
        <label className="add-photo-button">📷 {member.avatar_url ? 'Change photo' : 'Add photo'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) onAvatar(member.id, file); }} /></label>
        <button className="remove-profile-text" onClick={() => onRemove(member.id)}>Remove profile</button>
      </div>}
    </div>)}</div></div>
    {adding ? <form className="mini-form" onSubmit={(event) => { event.preventDefault(); onAdd({ name, color, emoji: name.slice(0, 1).toUpperCase(), member_type: 'child' }, photo); setAdding(false); }}>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Profile name" autoFocus required />
      <label className="add-photo-button">📷 Add photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setPhoto(event.target.files?.[0])} /></label>
      <div className="edit-colors">{colors.map((item) => <button type="button" className={color === item ? 'active' : ''} style={{ background: item }} key={item} onClick={() => setColor(item)} aria-label={`Use ${item}`} />)}<label className="color-wheel"><input type="color" value={color} onChange={(event) => setColor(event.target.value)} /><span>＋</span></label></div>
      <button className="primary-button">Add profile</button>
    </form> : <button className="popover-add" onClick={() => setAdding(true)}>＋ Add profile</button>}
  </div>;
}
