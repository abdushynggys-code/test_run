import type { CalendarEvent, FamilyMember } from '../../types/family';
import { formatTime } from '../../lib/date';

export function EventPill({ event, member, onClick }: { event: CalendarEvent; member?: FamilyMember; onClick: () => void }) {
  const color = event.color ?? member?.color ?? '#6157e5';
  return <button className="event-pill" style={{ '--event-color': color } as React.CSSProperties} onClick={onClick}><span>{event.all_day ? 'All day' : formatTime(event.start_time)}</span>{event.title}</button>;
}
