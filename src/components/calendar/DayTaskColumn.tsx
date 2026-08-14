import type { FamilyMember, Reminder, Todo } from '../../types/family';
import { formatTime } from '../../lib/date';

interface Props { todos: Todo[]; reminders: Reminder[]; members: FamilyMember[]; onTodo: (todo: Todo) => void; onReminder: (reminder: Reminder) => void; }
export function DayTaskColumn({ todos, reminders, members, onTodo, onReminder }: Props) {
  if (!todos.length && !reminders.length) return null;
  return <aside className="day-task-column">
    {reminders.length > 0 && <section><header><p className="eyebrow">DON’T FORGET</p><h3>Reminders</h3></header><div className="day-side-list">{reminders.map((item) => {
      const member = members.find((entry) => entry.id === item.family_member_id);
      return <button className={item.completed ? 'day-task completed' : 'day-task'} key={item.id} onClick={() => onReminder(item)}><span>{item.completed ? '✓' : '!'}</span><strong>{item.title}<small><i style={{ background: member?.color }} />{formatTime(item.reminder_time)} · {member?.name ?? 'Family'}</small></strong></button>;
    })}</div></section>}
    {todos.length > 0 && <section><header><p className="eyebrow">GET IT DONE</p><h3>To-do for this day</h3></header><div className="day-side-list">{todos.map((todo) => {
      const member = members.find((item) => item.id === todo.family_member_id);
      return <button className={todo.completed ? 'day-task completed' : 'day-task'} key={todo.id} onClick={() => onTodo(todo)}><span>{todo.completed ? '✓' : ''}</span><strong>{todo.title}<small><i style={{ background: member?.color }} />{member?.name ?? 'Family'} · {todo.priority} · ★ {todo.star_value ?? 1}</small></strong></button>;
    })}</div></section>}
  </aside>;
}
