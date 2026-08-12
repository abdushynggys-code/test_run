import type { CalendarEvent, FamilyMember } from '../../types/family';
import { isSameDay, monthGrid } from '../../lib/date';
import { EventPill } from './EventPill';

interface Props { date: Date; events: CalendarEvent[]; members: FamilyMember[]; firstDay: 0 | 1; onDay: (date: Date) => void; onEvent: (event: CalendarEvent) => void; }

export function MonthCalendar({ date, events, members, firstDay, onDay, onEvent }: Props) {
  const days = monthGrid(date, firstDay);
  const labels = firstDay === 1 ? ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return <div className="month-calendar">
    {labels.map((label) => <div className="weekday" key={label}>{label}</div>)}
    {days.map((day) => {
      const dayEvents = events.filter((event) => isSameDay(new Date(event.start_time), day));
      return <div className={`day-cell ${day.getMonth() !== date.getMonth() ? 'muted' : ''} ${isSameDay(day, new Date()) ? 'today' : ''}`} key={day.toISOString()}>
        <button className="day-number" onClick={() => onDay(day)}>{day.getDate()}</button>
        <div className="day-events">{dayEvents.slice(0, 3).map((event) => <EventPill key={event.id} event={event} member={members.find((member) => member.id === event.family_member_id)} onClick={() => onEvent(event)} />)}{dayEvents.length > 3 && <button className="more-events" onClick={() => onDay(day)}>+{dayEvents.length - 3} more</button>}</div>
      </div>;
    })}
  </div>;
}
