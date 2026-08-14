import type { CalendarEvent, FamilyMember, Reminder, Todo } from '../../types/family';
import { addDays, eventIncludesDay, formatTime, isSameDay, startOfWeek, toDateKey } from '../../lib/date';
import { EventPill } from './EventPill';
import { TodoPill } from './TodoPill';

const HOUR_HEIGHT = 36;
const DAY_HEIGHT = HOUR_HEIGHT * 24;
const minutes = (value: string) => { const time = new Date(value); return time.getHours() * 60 + time.getMinutes(); };

interface PositionedEvent { event: CalendarEvent; column: number; columns: number; }
function positionEvents(events: CalendarEvent[]): PositionedEvent[] {
  const positioned: PositionedEvent[] = [];
  [...events].sort((left, right) => minutes(left.start_time) - minutes(right.start_time)).forEach((event) => {
    const overlaps = positioned.filter((item) => minutes(event.start_time) < minutes(item.event.end_time) && minutes(event.end_time) > minutes(item.event.start_time));
    const used = new Set(overlaps.map((item) => item.column)); let column = 0;
    while (used.has(column)) column += 1;
    const columns = Math.max(column + 1, ...overlaps.map((item) => item.columns), 1);
    overlaps.forEach((item) => { item.columns = columns; }); positioned.push({ event, column, columns });
  });
  return positioned;
}

interface Props { date: Date; events: CalendarEvent[]; todos: Todo[]; reminders: Reminder[]; members: FamilyMember[]; firstDay: 0 | 1; onEvent: (event: CalendarEvent) => void; onTodo: (todo: Todo) => void; onReminder: (reminder: Reminder) => void; }

export function WeekCalendar({ date, events, todos, reminders, members, firstDay, onEvent, onTodo, onReminder }: Props) {
  const start = startOfWeek(date, firstDay);
  const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));

  return <div className="week-timeline-scroll"><div className="week-timeline">
    <div className="week-timeline-header"><span /><>{days.map((day) => <header className={isSameDay(day, new Date()) ? 'today' : ''} key={day.toISOString()}><small>{new Intl.DateTimeFormat('en', { weekday: 'short' }).format(day)}</small><strong>{day.getDate()}</strong></header>)}</></div>
    <div className="week-all-day"><span>ALL DAY</span>{days.map((day) => <div key={day.toISOString()}>
      {events.filter((event) => eventIncludesDay(event.start_time, event.end_time, day) && (event.all_day || !isSameDay(new Date(event.start_time), new Date(event.end_time)))).map((event) => <EventPill key={event.id} event={event} member={members.find((member) => member.id === event.family_member_id)} onClick={() => onEvent(event)} />)}
      {todos.filter((todo) => todo.due_date === toDateKey(day)).map((todo) => <TodoPill key={todo.id} todo={todo} member={members.find((member) => member.id === todo.family_member_id)} onToggle={() => onTodo(todo)} />)}
    </div>)}</div>
    <div className="week-time-body">
      <div className="week-time-labels">{Array.from({ length: 24 }, (_, hour) => <time key={hour}>{hour === 0 ? '12 AM' : new Intl.DateTimeFormat('en', { hour: 'numeric' }).format(new Date(2020, 0, 1, hour))}</time>)}</div>
      {days.map((day) => <div className={`week-time-column ${isSameDay(day, new Date()) ? 'today' : ''}`} key={day.toISOString()}>
        {positionEvents(events.filter((event) => eventIncludesDay(event.start_time, event.end_time, day) && !event.all_day && isSameDay(new Date(event.start_time), new Date(event.end_time)))).map(({ event, column, columns }) => {
          const member = members.find((item) => item.id === event.family_member_id); const startMinute = minutes(event.start_time); const endMinute = minutes(event.end_time);
          const top = startMinute / 60 * HOUR_HEIGHT; const height = Math.min(DAY_HEIGHT - top, Math.max(30, (endMinute - startMinute) / 60 * HOUR_HEIGHT));
          return <button className="week-timed-item" key={event.id} style={{ top, height, left: `calc(${column / columns * 100}% + 3px)`, width: `calc(${100 / columns}% - 6px)`, '--event-color': event.color ?? member?.color ?? 'var(--accent)' } as React.CSSProperties} onClick={() => onEvent(event)}><strong>{event.title}</strong><small>{formatTime(event.start_time)} · {member?.name ?? 'Family'}</small></button>;
        })}
        {reminders.filter((reminder) => isSameDay(new Date(reminder.reminder_time), day)).map((reminder) => { const member = members.find((item) => item.id === reminder.family_member_id); return <button className={`week-reminder-item ${reminder.completed ? 'completed' : ''}`} key={reminder.id} style={{ top: minutes(reminder.reminder_time) / 60 * HOUR_HEIGHT, '--event-color': member?.color ?? 'var(--accent)' } as React.CSSProperties} onClick={() => onReminder(reminder)}>◷ {reminder.title}<small>{formatTime(reminder.reminder_time)}</small></button>; })}
      </div>)}
    </div>
    <div className="week-end-time">11:59 PM</div>
  </div></div>;
}
