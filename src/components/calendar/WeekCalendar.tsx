import type { CSSProperties } from 'react';
import type { CalendarEvent, FamilyMember, Reminder, Todo } from '../../types/family';
import type { WeatherDay } from '../../lib/weather';
import { addDays, eventIncludesDay, formatTime, isSameDay, startOfWeek, toDateKey } from '../../lib/date';

interface Props {
  date: Date;
  events: CalendarEvent[];
  todos: Todo[];
  reminders: Reminder[];
  members: FamilyMember[];
  weather: WeatherDay[];
  firstDay: 0 | 1;
  onEvent: (event: CalendarEvent) => void;
  onTodo: (todo: Todo) => void;
  onReminder: (reminder: Reminder) => void;
  onAddEvent: (day: Date) => void;
}

const eventLabel = (event: CalendarEvent) => event.all_day
  ? 'All day'
  : `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`;

export function WeekCalendar(props: Props) {
  const { date, events, todos, reminders, members, weather, firstDay, onEvent, onTodo, onReminder, onAddEvent } = props;
  const start = startOfWeek(date, firstDay);
  const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  const now = new Date();

  return <div className="week-board-scroll"><div className="week-board">
    {days.map((day) => {
      const dayEvents = events
        .filter((event) => eventIncludesDay(event.start_time, event.end_time, day))
        .sort((left, right) => Number(right.all_day) - Number(left.all_day) || +new Date(left.start_time) - +new Date(right.start_time));
      const dayReminders = reminders.filter((reminder) => isSameDay(new Date(reminder.reminder_time), day));
      const dayTodos = todos.filter((todo) => todo.due_date === toDateKey(day));
      const forecast = weather.find((item) => item.date === toDateKey(day));
      return <section className={`week-day ${isSameDay(day, now) ? 'today' : ''}`} key={day.toISOString()}>
        <header>
          <div><small>{new Intl.DateTimeFormat('en', { weekday: 'short' }).format(day)}</small><strong>{day.getDate()}</strong></div>
          {forecast && <span className="week-weather"><b>{forecast.icon}</b><small>{forecast.high}° / {forecast.low}°</small></span>}
        </header>
        <div className="week-day-list">
          {dayEvents.map((event) => {
            const member = members.find((item) => item.id === event.family_member_id);
            const color = event.color ?? member?.color ?? 'var(--accent)';
            return <button className="week-event-card" style={{ '--event-color': color } as CSSProperties} key={event.id} onClick={() => onEvent(event)}>
              <span className="week-card-time">{eventLabel(event)}</span>
              <strong>{event.title}</strong>
              <small>{member?.name ?? 'Family'}{event.location ? ` · ${event.location}` : ''}</small>
            </button>;
          })}
          {dayReminders.map((reminder) => {
            const member = members.find((item) => item.id === reminder.family_member_id);
            return <button className={`week-event-card reminder ${reminder.completed ? 'completed' : ''}`} style={{ '--event-color': member?.color ?? 'var(--accent)' } as CSSProperties} key={reminder.id} onClick={() => onReminder(reminder)}>
              <span className="week-card-time">◷ {formatTime(reminder.reminder_time)}</span><strong>{reminder.title}</strong><small>Reminder · {member?.name ?? 'Family'}</small>
            </button>;
          })}
          {dayTodos.map((todo) => {
            const member = members.find((item) => item.id === todo.family_member_id);
            return <button className={`week-task-card ${todo.completed ? 'completed' : ''}`} key={todo.id} onClick={() => onTodo(todo)}>
              <span>{todo.completed ? '✓' : '○'}</span><strong>{todo.title}</strong><small style={{ color: member?.color }}>{member?.name ?? 'Family'}</small>
            </button>;
          })}
          {!dayEvents.length && !dayReminders.length && !dayTodos.length && <p className="week-empty">Nothing planned</p>}
        </div>
        <button className="week-add-event" onClick={() => onAddEvent(day)}>＋ Add event</button>
      </section>;
    })}
  </div></div>;
}
