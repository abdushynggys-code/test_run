import { useState } from 'react';
import type { CreateEvent, FamilyMember } from '../../types/family';
import { toDateKey } from '../../lib/date';

export function EventForm({ members, initialDate, onSubmit, onCancel }: { members: FamilyMember[]; initialDate: Date; onSubmit: (value: CreateEvent) => void; onCancel: () => void }) {
  const day = toDateKey(initialDate);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(day);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');
  const [memberId, setMemberId] = useState(members[0]?.id ?? '');
  const [location, setLocation] = useState('');
  const [allDay, setAllDay] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ title, description: '', start_time: `${date}T${start}:00`, end_time: `${date}T${end}:00`, all_day: allDay, location, family_member_id: memberId || null, color: null, repeat_rule: 'none' });
  }
  return <form className="form-grid" onSubmit={submit}>
    <label className="wide">Event title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Family dinner" autoFocus required /></label>
    <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
    <label>Family member<select value={memberId} onChange={(event) => setMemberId(event.target.value)}>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
    <label>Starts<input type="time" value={start} onChange={(event) => setStart(event.target.value)} required /></label>
    <label>Ends<input type="time" value={end} onChange={(event) => setEnd(event.target.value)} required /></label>
    <label className="wide">Location<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Optional" /></label>
    <label className="check-label wide"><input type="checkbox" checked={allDay} onChange={(event) => setAllDay(event.target.checked)} />All-day event</label>
    <div className="form-actions wide"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button">Create event</button></div>
  </form>;
}
