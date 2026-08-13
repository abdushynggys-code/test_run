import type { CalendarEvent, FamilyMember, Reminder, Todo } from '../../types/family';
import { eventIncludesDay, formatTime, isSameDay } from '../../lib/date';
import { DayTaskColumn } from './DayTaskColumn';

const HOUR_HEIGHT = 38;
interface PositionedEvent { event: CalendarEvent; column: number; columns: number; top: number; height: number; }

function minutes(value: string) { const date = new Date(value); return date.getHours() * 60 + date.getMinutes(); }
function positionEvents(events: CalendarEvent[]): PositionedEvent[] {
  const timed = events.filter((event) => !event.all_day).sort((a, b) => minutes(a.start_time) - minutes(b.start_time));
  const result: PositionedEvent[] = [];
  timed.forEach((event) => {
    const start = minutes(event.start_time); const end = minutes(event.end_time);
    const overlaps = result.filter((item) => start < minutes(item.event.end_time) && end > minutes(item.event.start_time));
    const used = new Set(overlaps.map((item) => item.column)); let column = 0;
    while (used.has(column)) column += 1;
    const columns = Math.max(1, column + 1, ...overlaps.map((item) => item.columns));
    overlaps.forEach((item) => { item.columns = Math.max(item.columns, columns); });
    result.push({ event, column, columns, top: start / 60 * HOUR_HEIGHT, height: Math.max(30, (end - start) / 60 * HOUR_HEIGHT) });
  });
  return result;
}

export function DayCalendar({ date, events, todos, reminders, members, onEvent, onTodo, onReminder }: { date: Date; events: CalendarEvent[]; todos: Todo[]; reminders: Reminder[]; members: FamilyMember[]; onEvent: (event: CalendarEvent) => void; onTodo: (todo: Todo) => void; onReminder: (reminder: Reminder) => void }) {
  const dayEvents = events.filter((event) => eventIncludesDay(event.start_time, event.end_time, date));
  const allDay = dayEvents.filter((event) => event.all_day || !isSameDay(new Date(event.start_time), new Date(event.end_time)));
  const positioned = positionEvents(dayEvents.filter((event) => !allDay.includes(event)));
  const dayTodos = todos.filter((todo) => todo.due_date && isSameDay(new Date(`${todo.due_date}T12:00:00`), date));
  const dayReminders = reminders.filter((item) => isSameDay(new Date(item.reminder_time), date));
  const hasSideItems = dayTodos.length > 0 || dayReminders.length > 0;
  return <div className={hasSideItems ? 'day-view with-side' : 'day-view'}>
    <div className="day-schedule">
      <div className="day-heading"><span>{isSameDay(date, new Date()) ? 'TODAY' : new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date)}</span><strong>{new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric' }).format(date)}</strong></div>
      {allDay.length > 0 && <div className="all-day-row"><time>All day</time><div>{allDay.map((event) => { const member = members.find((item) => item.id === event.family_member_id); return <button key={event.id} style={{ borderColor: event.color ?? member?.color }} onClick={() => onEvent(event)}>{event.title}</button>; })}</div></div>}
      <div className="hour-scroll"><div className="hour-grid">
        {Array.from({ length: 24 }, (_, hour) => <div className="hour-row" key={hour}><time>{hour === 0 ? '12:00 AM' : new Intl.DateTimeFormat('en', { hour: 'numeric' }).format(new Date(2020, 0, 1, hour))}</time><span /></div>)}
        <div className="timed-events">{positioned.map(({ event, column, columns, top, height }) => { const member = members.find((item) => item.id === event.family_member_id); const color = event.color ?? member?.color ?? '#a86446'; return <button className="timed-event" key={event.id} style={{ top, height, left: `calc(${column / columns * 100}% + 4px)`, width: `calc(${100 / columns}% - 8px)`, '--event-color': color } as React.CSSProperties} onClick={() => onEvent(event)}><strong>{event.title}</strong><small>{formatTime(event.start_time)} · {member?.name ?? 'Family'}</small></button>; })}</div>
        <div className="day-end-time">11:59 PM</div>
      </div></div>
    </div>
    <DayTaskColumn todos={dayTodos} reminders={dayReminders} members={members} onTodo={onTodo} onReminder={onReminder} />
  </div>;
}
