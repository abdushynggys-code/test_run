import { useState } from 'react';
import type { CreateMember, FamilyMember, Todo } from '../../types/family';
import { PROFILE_COLORS } from '../../lib/themePalettes';
import { rewardProgress } from '../../lib/rewards';

interface Props {
  members: FamilyMember[];
  todos: Todo[];
  winnerIds: Set<string>;
  onAdd: (value: CreateMember, file?: File) => void;
  onAvatar: (id: string, file: File) => void;
  onColor: (id: string, color: string) => void;
  onName: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export function FamilyPopover(props: Props) {
  const { members, todos, winnerIds, onAdd, onAvatar, onColor, onName, onRemove, onClose } = props;
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROFILE_COLORS[0]);
  const [photo, setPhoto] = useState<File>();
  const [memberType, setMemberType] = useState<FamilyMember['member_type']>('child');

  return <div className="popover family-popover">
    <header><div><p className="eyebrow">PROFILES</p><h3>Family</h3></div><button className="icon-button" onClick={onClose}>×</button></header>
    <div className="family-scroll"><div className="family-list">{members.map((member) => { const progress = rewardProgress(member.id, todos); return <div className="profile-row" key={member.id}>
      <span className={`profile-avatar ${winnerIds.has(member.id) ? 'crowned' : ''}`} style={{ background: member.color }}>{member.avatar_url ? <img src={member.avatar_url} alt={`${member.name} profile`} /> : member.emoji}</span>
      <div className="profile-reward"><span><strong>{member.name}</strong>{member.member_type === 'child' && <em>Level {progress.level}</em>}</span>
        <small>{member.member_type === 'child' ? `★ ${progress.totalStars} · ${progress.starsToNext} to next level` : member.member_type === 'adult' ? 'parent · not ranked by default' : 'family group'}</small>
        {member.member_type === 'child' && <div className="profile-level"><i style={{ width: `${progress.percent}%` }} /></div>}
      </div>
      <button className="change-profile" onClick={() => setEditingId(editingId === member.id ? null : member.id)}>Change</button>
      {editingId === member.id && <div className="profile-editor">
        <label>Profile name<input defaultValue={member.name} onBlur={(event) => { const next = event.target.value.trim(); if (next && next !== member.name) onName(member.id, next); }} /></label>
        <div><label>Profile color</label><div className="edit-colors">{PROFILE_COLORS.map((item) => <button type="button" className={member.color === item ? 'active' : ''} style={{ background: item }} key={item} onClick={() => onColor(member.id, item)} aria-label={`Use ${item}`} />)}<label className="color-wheel"><input type="color" value={member.color} onChange={(event) => onColor(member.id, event.target.value)} /><span>＋</span></label></div></div>
        <label className="add-photo-button">📷 {member.avatar_url ? 'Change photo' : 'Add photo'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) onAvatar(member.id, file); }} /></label>
        <button className="remove-profile-text" onClick={() => onRemove(member.id)}>Remove profile</button>
      </div>}
    </div>; })}</div></div>
    {adding ? <form className="mini-form" onSubmit={(event) => { event.preventDefault(); onAdd({ name, color, emoji: name.slice(0, 1).toUpperCase(), member_type: memberType }, photo); setName(''); setPhoto(undefined); setMemberType('child'); setAdding(false); }}>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Profile name" autoFocus required />
      <fieldset className="profile-type-picker"><legend>Profile type</legend><div>
        {(['adult', 'child', 'group'] as const).map((type) => <button type="button" className={memberType === type ? 'active' : ''} key={type} onClick={() => setMemberType(type)}>{type === 'adult' ? 'Parent' : type === 'child' ? 'Child' : 'Group'}</button>)}
      </div></fieldset>
      <label className="add-photo-button">📷 Add photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setPhoto(event.target.files?.[0])} /></label>
      <div className="edit-colors">{PROFILE_COLORS.map((item) => <button type="button" className={color === item ? 'active' : ''} style={{ background: item }} key={item} onClick={() => setColor(item)} aria-label={`Use ${item}`} />)}<label className="color-wheel"><input type="color" value={color} onChange={(event) => setColor(event.target.value)} /><span>＋</span></label></div>
      <button className="primary-button">Add profile</button>
    </form> : <button className="popover-add" onClick={() => setAdding(true)}>＋ Add profile</button>}
  </div>;
}
