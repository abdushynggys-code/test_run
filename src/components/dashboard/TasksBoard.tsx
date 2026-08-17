import { useState } from 'react';
import type { FamilyMember, Todo } from '../../types/family';
import { TaskMemberColumn } from './TaskMemberColumn';

interface Props {
  todos: Todo[];
  members: FamilyMember[];
  onToggle: (todo: Todo) => void;
  onAdd: () => void;
}

export function TasksBoard({ todos, members, onToggle, onAdd }: Props) {
  const [showFinished, setShowFinished] = useState(true);
  const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const completed = todos.filter((todo) => todo.completed);
  const earnedStars = completed.reduce((sum, todo) => sum + todo.star_value, 0);
  const groups = members.map((member) => ({ member, todos: todos.filter((todo) => todo.family_member_id === member.id) }));
  const shared = todos.filter((todo) => !todo.family_member_id);

  return <section className="tasks-board">
    <header className="tasks-board-header">
      <div><p className="eyebrow">ROUTINES & CHORES</p><h1>Family tasks</h1><span>{today}</span></div>
      <div className="tasks-board-actions"><button className={`task-filter-button ${showFinished ? 'active' : ''}`} onClick={() => setShowFinished((value) => !value)}>✓ Finished</button><button className="primary-button" onClick={onAdd}>＋ Add task</button></div>
    </header>
    <div className="task-summary-row" data-tour="task-rewards">
      <article><span>◎</span><div><strong>{todos.length - completed.length}</strong><small>still to do</small></div></article>
      <article><span>★</span><div><strong>{earnedStars}</strong><small>stars earned</small></div></article>
      <article><span>✓</span><div><strong>{completed.length}</strong><small>completed</small></div></article>
    </div>
    <div className="task-member-grid">
      {groups.map(({ member, todos: memberTodos }) => <TaskMemberColumn key={member.id} member={member} todos={memberTodos} showFinished={showFinished} onToggle={onToggle} />)}
      {shared.length > 0 && <TaskMemberColumn member={null} todos={shared} showFinished={showFinished} onToggle={onToggle} />}
    </div>
  </section>;
}
