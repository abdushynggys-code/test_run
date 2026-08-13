import { useState } from 'react';
import type { CreateEvent, FamilyMember } from '../../types/family';
import { toDateKey } from '../../lib/date';

interface Props { members: FamilyMember[]; initialDate: Date; initialEndDate?: Date; initialMemberId?: string | null; onSubmit: (value: CreateEvent) => void; onCancel: () => void; }
export function EventForm({ members, initialDate, initialEndDate, initialMemberId, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(toDateKey(initialDate));
  const [endDate, setEndDate] = useState(toDateKey(initialEndDate ?? initialDate));
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');
  const [memberId, setMemberId] = useState(initialMemberId ?? members[0]?.id ?? '');
  const [location, setLocation] = useState('');
  const [allDay, setAllDay] = useState(Boolean(initialEndDate));
  const [color, setColor] = useState('');
  function submit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ title, description: '', start_time: `${startDate}T${allDay ? '00:00' : start}:00`, end_time: `${endDate}T${allDay ? '23:59' : end}:00`, all_day: allDay, location, family_member_id: memberId || null, color: color || null, repeat_rule: 'none' });
  }
  return <form className="form-grid" onSubmit={submit}>
    <label className="wide">Event title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Road trip or cleaning week" autoFocus required /></label>
    <label>Starts on<input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); if (event.target.value > endDate) setEndDate(event.target.value); }} required /></label><label>Ends on<input type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} required /></label>
    <label>Family member<select value={memberId} onChange={(event) => setMemberId(event.target.value)}>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label><label>Custom color<div className="event-color-field"><input type="color" value={color || '#78866b'} onChange={(event) => setColor(event.target.value)} /><button type="button" onClick={() => setColor('')}>Use profile color</button></div></label>
    {!allDay && <><label>Starts<input type="time" value={start} onChange={(event) => setStart(event.target.value)} required /></label><label>Ends<input type="time" value={end} onChange={(event) => setEnd(event.target.value)} required /></label></>}
    <label className="wide">Location<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Optional" /></label><label className="check-label wide"><input type="checkbox" checked={allDay} onChange={(event) => setAllDay(event.target.checked)} />All-day event</label>
    <div className="form-actions wide"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button">Create event</button></div>
  </form>;
}
