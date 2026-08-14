import type { FamilyMember, Todo } from '../../types/family';

export function TodoPill({ todo, member, onToggle }: { todo: Todo; member?: FamilyMember; onToggle: () => void }) {
  return <button className={`todo-pill ${todo.completed ? 'completed' : ''}`} style={{ '--todo-color': member?.color ?? 'var(--accent)' } as React.CSSProperties} onClick={onToggle}><span>{todo.completed ? '✓' : '□'}</span>{todo.title} <b>★{todo.star_value ?? 1}</b></button>;
}
