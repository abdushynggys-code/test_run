import { useState } from 'react';
import type { CreateTodo, FamilyMember, Priority } from '../../types/family';
import { toDateKey } from '../../lib/date';

export function TodoForm({ members, onSubmit, onCancel }: { members: FamilyMember[]; onSubmit: (value: CreateTodo) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(toDateKey(new Date()));
  const [memberId, setMemberId] = useState(members[0]?.id ?? '');
  const [priority, setPriority] = useState<Priority>('medium');
  return <form className="form-grid" onSubmit={(event) => { event.preventDefault(); onSubmit({ title, description: '', family_member_id: memberId || null, due_date: dueDate || null, priority }); }}>
    <label className="wide">Task<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Buy groceries" autoFocus required /></label>
    <label>Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
    <label>Assigned to<select value={memberId} onChange={(event) => setMemberId(event.target.value)}>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
    <label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
    <div className="form-actions wide"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button">Add task</button></div>
  </form>;
}
