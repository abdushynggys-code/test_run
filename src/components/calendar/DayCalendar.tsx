import type { CalendarEvent, FamilyMember } from '../../types/family';
import { formatTime, isSameDay } from '../../lib/date';

export function DayCalendar({ date, events, members, onEvent }: { date: Date; events: CalendarEvent[]; members: FamilyMember[]; onEvent: (event: CalendarEvent) => void }) {
  const dayEvents = events.filter((event) => isSameDay(new Date(event.start_time), date));
  return <div className="day-calendar"><div className="day-heading"><span>{isSameDay(date, new Date()) ? 'TODAY' : new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date)}</span><strong>{new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric' }).format(date)}</strong></div>
    {dayEvents.length ? dayEvents.map((event) => { const member = members.find((item) => item.id === event.family_member_id); return <button className="timeline-event" key={event.id} onClick={() => onEvent(event)}><time>{event.all_day ? 'All day' : formatTime(event.start_time)}</time><i style={{ background: event.color ?? member?.color }} /><span><strong>{event.title}</strong><small>{member?.name}{event.location ? ` · ${event.location}` : ''}</small></span></button>; }) : <div className="calendar-empty">No events today</div>}
  </div>;
}
