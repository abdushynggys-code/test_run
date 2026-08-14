import { useRef, useState } from 'react';
import type { CalendarEvent, FamilyMember, Reminder, Todo } from '../../types/family';
import { eventIncludesDay, isSameDay, monthGrid, toDateKey } from '../../lib/date';
import { EventPill } from './EventPill';
import { TodoPill } from './TodoPill';
import { ReminderPill } from './ReminderPill';

interface Props { date: Date; events: CalendarEvent[]; todos: Todo[]; reminders: Reminder[]; members: FamilyMember[]; firstDay: 0 | 1; onDay: (date: Date) => void; onRange: (start: Date, end: Date) => void; onEvent: (event: CalendarEvent) => void; onTodo: (todo: Todo) => void; onReminder: (reminder: Reminder) => void; }
function assignMultiDayLanes(events: CalendarEvent[]) {
  const lanes: CalendarEvent[][] = [];
  [...events].sort((left, right) => left.start_time.localeCompare(right.start_time)).forEach((event) => {
    const lane = lanes.findIndex((items) => toDateKey(new Date(items[items.length - 1].end_time)) < toDateKey(new Date(event.start_time)));
    if (lane < 0) lanes.push([event]); else lanes[lane].push(event);
  });
  return lanes;
}

export function MonthCalendar({ date, events, todos, reminders, members, firstDay, onDay, onRange, onEvent, onTodo, onReminder }: Props) {
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [holding, setHolding] = useState(false);
  const timer = useRef<number>();
  const days = monthGrid(date, firstDay);
  const multiDayLanes = assignMultiDayLanes(events.filter((event) => toDateKey(new Date(event.start_time)) !== toDateKey(new Date(event.end_time))));
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
    {days.map((day, dayIndex) => {
      const dayEvents = events.filter((event) => eventIncludesDay(event.start_time, event.end_time, day) && toDateKey(new Date(event.start_time)) === toDateKey(new Date(event.end_time)));
      const dayTodos = todos.filter((todo) => todo.due_date && isSameDay(new Date(`${todo.due_date}T12:00:00`), day));
      const dayReminders = reminders.filter((reminder) => isSameDay(new Date(reminder.reminder_time), day));
      const weekStartDay = days[Math.floor(dayIndex / 7) * 7]; const weekEndDay = days[Math.floor(dayIndex / 7) * 7 + 6];
      const activeLanes = multiDayLanes.filter((lane) => lane.some((event) => toDateKey(new Date(event.start_time)) <= toDateKey(weekEndDay) && toDateKey(new Date(event.end_time)) >= toDateKey(weekStartDay)));
      const isRangeStart = rangeStart && isSameDay(rangeStart, day);
      return <div className={`day-cell ${day.getMonth() !== date.getMonth() ? 'muted' : ''} ${isSameDay(day, new Date()) ? 'today' : ''} ${isRangeStart ? 'range-start' : ''}`} key={day.toISOString()}>
        <button className="day-number" onPointerDown={() => startHold(day)} onPointerUp={endHold} onPointerLeave={endHold} onClick={() => chooseDay(day)}>{day.getDate()}</button>
        <div className="multi-day-slots">{activeLanes.map((lane, index) => {
          const event = lane.find((item) => eventIncludesDay(item.start_time, item.end_time, day));
          if (!event) return <span className="multi-day-placeholder" key={index} />;
          const starts = toDateKey(new Date(event.start_time)) === toDateKey(day); const ends = toDateKey(new Date(event.end_time)) === toDateKey(day); const weekStart = day.getDay() === firstDay; const weekEnd = day.getDay() === (firstDay + 6) % 7;
          const segment = starts && ends ? 'single' : starts || weekStart ? 'start' : ends || weekEnd ? 'end' : 'middle';
          return <EventPill key={event.id} event={event} segment={segment} showLabel={starts || weekStart} member={members.find((member) => member.id === event.family_member_id)} onClick={() => onEvent(event)} />;
        })}</div>
        <div className="day-events">{dayEvents.map((event) => <EventPill key={event.id} event={event} member={members.find((member) => member.id === event.family_member_id)} onClick={() => onEvent(event)} />)}{dayTodos.map((todo) => <TodoPill key={todo.id} todo={todo} member={members.find((member) => member.id === todo.family_member_id)} onToggle={() => onTodo(todo)} />)}{dayReminders.map((reminder) => <ReminderPill key={reminder.id} reminder={reminder} member={members.find((member) => member.id === reminder.family_member_id)} onToggle={() => onReminder(reminder)} />)}</div>
      </div>;
    })}
  </div></>;
}
