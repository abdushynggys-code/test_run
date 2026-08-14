import type { CSSProperties } from 'react';
import { toDateKey } from '../../lib/date';
import type { FamilyMember, Todo } from '../../types/family';

interface Props {
  member: FamilyMember | null;
  todos: Todo[];
  showFinished: boolean;
  onToggle: (todo: Todo) => void;
}

export function TaskMemberColumn({ member, todos, showFinished, onToggle }: Props) {
  const visible = todos.filter((todo) => showFinished || !todo.completed)
    .sort((left, right) => Number(left.completed) - Number(right.completed));
  const complete = todos.filter((todo) => todo.completed).length;
  const percent = todos.length ? Math.round(complete / todos.length * 100) : 0;
  const color = member?.color ?? '#64748b';
  const style = { '--member-color': color, '--task-progress': `${percent * 3.6}deg` } as CSSProperties;

  return <article className="task-member-column" style={style}>
    <header>
      <span className="task-member-avatar">{member?.avatar_url ? <img src={member.avatar_url} alt="" /> : member?.emoji ?? '⌂'}</span>
      <div><strong>{member?.name ?? 'Shared'}</strong><small>{complete} of {todos.length} done</small></div>
      <span className="task-progress-ring"><b>{percent}%</b></span>
    </header>
    <div className="task-cards">{visible.map((todo) => {
      const overdue = Boolean(todo.due_date && todo.due_date < toDateKey(new Date()) && !todo.completed);
      return <button className={`task-card priority-${todo.priority} ${todo.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`} key={todo.id} onClick={() => onToggle(todo)}>
        <span className="task-check">{todo.completed ? '✓' : ''}</span>
        <span className="task-card-copy"><strong>{todo.title}</strong><small>{overdue ? 'Late' : todo.due_date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${todo.due_date}T12:00:00`)) : 'Anytime'}</small></span>
        <span className="task-star">★ {todo.star_value}</span>
      </button>;
    })}
      {!visible.length && <div className="task-empty"><span>✨</span><strong>All clear</strong><small>Nothing waiting for {member?.name ?? 'the family'}.</small></div>}
    </div>
  </article>;
}
