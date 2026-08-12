import type { CalendarEvent, FamilyMember } from '../../types/family';
import { formatTime } from '../../lib/date';

export function EventDetails({ event, members, onDelete, onClose }: { event: CalendarEvent; members: FamilyMember[]; onDelete: () => void; onClose: () => void }) {
  const member = members.find((item) => item.id === event.family_member_id);
  return <div className="event-details"><span className="event-marker" style={{ background: event.color ?? member?.color }} /><h3>{event.title}</h3><p>{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(event.start_time))}</p><p>{event.all_day ? 'All day' : `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`}</p>{event.location && <p>⌖ {event.location}</p>}<span className="member-tag" style={{ background: member?.color }}>{member?.name ?? 'Family'}</span><div className="form-actions"><button className="danger-button" onClick={onDelete}>Delete event</button><button className="primary-button" onClick={onClose}>Done</button></div></div>;
}
