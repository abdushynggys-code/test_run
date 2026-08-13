import type { CalendarEvent, FamilyMember, Reminder, Todo } from '../../types/family';
import { addDays, eventIncludesDay, isSameDay, startOfWeek } from '../../lib/date';
import { EventPill } from './EventPill';
import { TodoPill } from './TodoPill';
import { ReminderPill } from './ReminderPill';

export function WeekCalendar({ date, events, todos, reminders, members, firstDay, onEvent, onTodo, onReminder }: { date: Date; events: CalendarEvent[]; todos: Todo[]; reminders: Reminder[]; members: FamilyMember[]; firstDay: 0 | 1; onEvent: (event: CalendarEvent) => void; onTodo: (todo: Todo) => void; onReminder: (reminder: Reminder) => void }) {
  const start = startOfWeek(date, firstDay);
  return <div className="week-calendar">{Array.from({ length: 7 }, (_, index) => addDays(start, index)).map((day) => <section className={isSameDay(day, new Date()) ? 'today' : ''} key={day.toISOString()}>
    <header><span>{new Intl.DateTimeFormat('en', { weekday: 'short' }).format(day)}</span><strong>{day.getDate()}</strong></header>
    <div>{events.filter((event) => eventIncludesDay(event.start_time, event.end_time, day)).map((event) => <EventPill key={event.id} event={event} member={members.find((member) => member.id === event.family_member_id)} onClick={() => onEvent(event)} />)}{todos.filter((todo) => todo.due_date && isSameDay(new Date(`${todo.due_date}T12:00:00`), day)).map((todo) => <TodoPill key={todo.id} todo={todo} member={members.find((member) => member.id === todo.family_member_id)} onToggle={() => onTodo(todo)} />)}{reminders.filter((reminder) => isSameDay(new Date(reminder.reminder_time), day)).map((reminder) => <ReminderPill key={reminder.id} reminder={reminder} member={members.find((member) => member.id === reminder.family_member_id)} onToggle={() => onReminder(reminder)} />)}<p className="empty-day">No plans</p></div>
  </section>)}</div>;
}
