import type { CalendarEvent, FamilyMember } from '../../types/family';
import { addDays, isSameDay, startOfWeek } from '../../lib/date';
import { EventPill } from './EventPill';

export function WeekCalendar({ date, events, members, firstDay, onEvent }: { date: Date; events: CalendarEvent[]; members: FamilyMember[]; firstDay: 0 | 1; onEvent: (event: CalendarEvent) => void }) {
  const start = startOfWeek(date, firstDay);
  return <div className="week-calendar">{Array.from({ length: 7 }, (_, index) => addDays(start, index)).map((day) => <section className={isSameDay(day, new Date()) ? 'today' : ''} key={day.toISOString()}>
    <header><span>{new Intl.DateTimeFormat('en', { weekday: 'short' }).format(day)}</span><strong>{day.getDate()}</strong></header>
    <div>{events.filter((event) => isSameDay(new Date(event.start_time), day)).map((event) => <EventPill key={event.id} event={event} member={members.find((member) => member.id === event.family_member_id)} onClick={() => onEvent(event)} />)}<p className="empty-day">No plans</p></div>
  </section>)}</div>;
}
