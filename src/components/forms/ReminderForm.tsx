import { useState } from 'react';
import type { CreateReminder, FamilyMember, Priority } from '../../types/family';
import { toDateKey } from '../../lib/date';

export function ReminderForm({ members, onSubmit, onCancel }: { members: FamilyMember[]; onSubmit: (value: CreateReminder) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(toDateKey(new Date()));
  const [time, setTime] = useState('09:00');
  const [memberId, setMemberId] = useState(members[0]?.id ?? '');
  const [priority, setPriority] = useState<Priority>('medium');
  return <form className="form-grid" onSubmit={(event) => { event.preventDefault(); onSubmit({ title, description: '', reminder_time: `${date}T${time}:00`, family_member_id: memberId || null, priority, repeat_rule: 'none' }); }}>
    <label className="wide">Reminder<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Take out the trash" autoFocus required /></label>
    <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
    <label>Time<input type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></label>
    <label>Assigned to<select value={memberId} onChange={(event) => setMemberId(event.target.value)}>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
    <label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
    <div className="form-actions wide"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button">Add reminder</button></div>
  </form>;
}
