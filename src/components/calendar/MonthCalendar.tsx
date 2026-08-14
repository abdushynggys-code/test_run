import { useRef, useState } from 'react';
import type { CalendarEvent, FamilyMember, Reminder, Todo } from '../../types/family';
import { eventIncludesDay, isSameDay, monthGrid } from '../../lib/date';
import { EventPill } from './EventPill';
import { TodoPill } from './TodoPill';
import { ReminderPill } from './ReminderPill';

interface Props { date: Date; events: CalendarEvent[]; todos: Todo[]; reminders: Reminder[]; members: FamilyMember[]; firstDay: 0 | 1; onDay: (date: Date) => void; onRange: (start: Date, end: Date) => void; onEvent: (event: CalendarEvent) => void; onTodo: (todo: Todo) => void; onReminder: (reminder: Reminder) => void; }
export function MonthCalendar({ date, events, todos, reminders, members, firstDay, onDay, onRange, onEvent, onTodo, onReminder }: Props) {
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [holding, setHolding] = useState(false);
  const timer = useRef<number>();
  const days = monthGrid(date, firstDay);
  const labels = firstDay === 1 ? ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  function startHold(day: Date) { setHolding(false); timer.current = window.setTimeout(() => { setRangeStart(day); setHolding(true); navigator.vibrate?.(35); }, 550); }
  function endHold() { if (timer.current) window.clearTimeout(timer.current); }
  function chooseDay(day: Date) {
    if (holding) { setHolding(false); return; }
    if (!rangeStart) { onDay(day); return; }
    const start = day < rangeStart ? day : rangeStart;
    const end = day < rangeStart ? rangeStart : day;
    setRangeStart(null); onRange(start, end);
  }
  return <><div className="range-help">{rangeStart ? `Range started ${rangeStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })} — choose the last day` : 'Tip: hold a day to start a multi-day event'}</div><div className="month-calendar">
    {labels.map((label) => <div className="weekday" key={label}>{label}</div>)}
    {days.map((day) => {
      const dayEvents = events.filter((event) => eventIncludesDay(event.start_time, event.end_time, day));
      const dayTodos = todos.filter((todo) => todo.due_date && isSameDay(new Date(`${todo.due_date}T12:00:00`), day));
      const dayReminders = reminders.filter((reminder) => isSameDay(new Date(reminder.reminder_time), day));
      const isRangeStart = rangeStart && isSameDay(rangeStart, day);
      return <div className={`day-cell ${day.getMonth() !== date.getMonth() ? 'muted' : ''} ${isSameDay(day, new Date()) ? 'today' : ''} ${isRangeStart ? 'range-start' : ''}`} key={day.toISOString()}>
        <button className="day-number" onPointerDown={() => startHold(day)} onPointerUp={endHold} onPointerLeave={endHold} onClick={() => chooseDay(day)}>{day.getDate()}</button>
        <div className="day-events">{dayEvents.map((event) => <EventPill key={event.id} event={event} member={members.find((member) => member.id === event.family_member_id)} onClick={() => onEvent(event)} />)}{dayTodos.map((todo) => <TodoPill key={todo.id} todo={todo} member={members.find((member) => member.id === todo.family_member_id)} onToggle={() => onTodo(todo)} />)}{dayReminders.map((reminder) => <ReminderPill key={reminder.id} reminder={reminder} member={members.find((member) => member.id === reminder.family_member_id)} onToggle={() => onReminder(reminder)} />)}</div>
      </div>;
    })}
  </div></>;
}
