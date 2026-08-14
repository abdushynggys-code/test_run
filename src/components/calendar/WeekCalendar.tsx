import type { CalendarEvent, FamilyMember, Reminder, Todo } from '../../types/family';
import { addDays, eventIncludesDay, formatTime, isSameDay, startOfWeek, toDateKey } from '../../lib/date';
import { EventPill } from './EventPill';
import { TodoPill } from './TodoPill';

const HOUR_HEIGHT = 36;
const DAY_HEIGHT = HOUR_HEIGHT * 24;
const minutes = (value: string) => { const time = new Date(value); return time.getHours() * 60 + time.getMinutes(); };
type TimedEntry = { kind: 'event'; event: CalendarEvent; start: number; end: number } | { kind: 'reminder'; reminder: Reminder; start: number; end: number };
interface PositionedEntry { entry: TimedEntry; column: number; columns: number; }

function positionEntries(entries: TimedEntry[]): PositionedEntry[] {
  const positioned: PositionedEntry[] = [];
  [...entries].sort((left, right) => left.start - right.start).forEach((entry) => {
    const overlaps = positioned.filter((item) => entry.start < item.entry.end && entry.end > item.entry.start);
    const used = new Set(overlaps.map((item) => item.column)); let column = 0;
    while (used.has(column)) column += 1;
    const columns = Math.max(column + 1, ...overlaps.map((item) => item.columns), 1);
    overlaps.forEach((item) => { item.columns = columns; }); positioned.push({ entry, column, columns });
  });
  return positioned;
}

interface Props { date: Date; events: CalendarEvent[]; todos: Todo[]; reminders: Reminder[]; members: FamilyMember[]; firstDay: 0 | 1; onEvent: (event: CalendarEvent) => void; onTodo: (todo: Todo) => void; onReminder: (reminder: Reminder) => void; }

export function WeekCalendar({ date, events, todos, reminders, members, firstDay, onEvent, onTodo, onReminder }: Props) {
  const start = startOfWeek(date, firstDay); const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  return <div className="week-timeline-scroll"><div className="week-timeline">
    <div className="week-timeline-header"><span />{days.map((day) => <header className={isSameDay(day, new Date()) ? 'today' : ''} key={day.toISOString()}><small>{new Intl.DateTimeFormat('en', { weekday: 'short' }).format(day)}</small><strong>{day.getDate()}</strong></header>)}</div>
    <div className="week-all-day"><span>ALL DAY</span>{days.map((day) => <div key={day.toISOString()}>{events.filter((event) => eventIncludesDay(event.start_time, event.end_time, day) && (event.all_day || !isSameDay(new Date(event.start_time), new Date(event.end_time)))).map((event) => <EventPill key={event.id} event={event} member={members.find((member) => member.id === event.family_member_id)} onClick={() => onEvent(event)} />)}{todos.filter((todo) => todo.due_date === toDateKey(day)).map((todo) => <TodoPill key={todo.id} todo={todo} member={members.find((member) => member.id === todo.family_member_id)} onToggle={() => onTodo(todo)} />)}</div>)}</div>
    <div className="week-time-body"><div className="week-time-labels">{Array.from({ length: 24 }, (_, hour) => <time key={hour}>{hour === 0 ? '12 AM' : new Intl.DateTimeFormat('en', { hour: 'numeric' }).format(new Date(2020, 0, 1, hour))}</time>)}</div>
      {days.map((day) => {
        const timedEvents: TimedEntry[] = events.filter((event) => eventIncludesDay(event.start_time, event.end_time, day) && !event.all_day && isSameDay(new Date(event.start_time), new Date(event.end_time))).map((event) => ({ kind: 'event', event, start: minutes(event.start_time), end: minutes(event.end_time) }));
        const timedReminders: TimedEntry[] = reminders.filter((reminder) => isSameDay(new Date(reminder.reminder_time), day)).map((reminder) => ({ kind: 'reminder', reminder, start: minutes(reminder.reminder_time), end: minutes(reminder.reminder_time) + 30 }));
        return <div className={`week-time-column ${isSameDay(day, new Date()) ? 'today' : ''}`} key={day.toISOString()}>{positionEntries([...timedEvents, ...timedReminders]).map(({ entry, column, columns }) => {
          const top = entry.start / 60 * HOUR_HEIGHT; const height = Math.min(DAY_HEIGHT - top, Math.max(entry.kind === 'event' ? 30 : 24, (entry.end - entry.start) / 60 * HOUR_HEIGHT)); const lane = { top, height, left: `calc(${column / columns * 100}% + 3px)`, width: `calc(${100 / columns}% - 6px)` };
          if (entry.kind === 'event') { const event = entry.event; const member = members.find((item) => item.id === event.family_member_id); return <button className="week-timed-item" key={`event-${event.id}`} style={{ ...lane, '--event-color': event.color ?? member?.color ?? 'var(--accent)' } as React.CSSProperties} onClick={() => onEvent(event)}><strong>{event.title}</strong><small>{formatTime(event.start_time)}–{formatTime(event.end_time)} · {member?.name ?? 'Family'}</small></button>; }
          const reminder = entry.reminder; const member = members.find((item) => item.id === reminder.family_member_id); return <button className={`week-reminder-item ${reminder.completed ? 'completed' : ''}`} key={`reminder-${reminder.id}`} style={{ ...lane, '--event-color': member?.color ?? 'var(--accent)' } as React.CSSProperties} onClick={() => onReminder(reminder)}>◷ {reminder.title}<small>{formatTime(reminder.reminder_time)}</small></button>;
        })}</div>;
      })}
    </div><div className="week-end-time">11:59 PM</div>
  </div></div>;
}
