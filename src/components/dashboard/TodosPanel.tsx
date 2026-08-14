import type { FamilyMember, Todo } from '../../types/family';

export function TodosPanel({ items, members, onAdd, onToggle }: { items: Todo[]; members: FamilyMember[]; onAdd: () => void; onToggle: (id: string, completed: boolean) => void }) {
  return <section className="bottom-panel"><header><div><p className="eyebrow">GET IT DONE</p><h2>Family to-do</h2></div><button className="panel-add" onClick={onAdd}>＋ Add</button></header>
    <div className="compact-list">{items.length ? items.slice(0, 4).map((item) => {
      const member = members.find((entry) => entry.id === item.family_member_id);
      const due = item.due_date ? `Due ${new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${item.due_date}T12:00:00`))}` : 'No due date';
      return <button className={`compact-item ${item.completed ? 'completed' : ''}`} key={item.id} onClick={() => onToggle(item.id, !item.completed)}><span className="square-check">{item.completed ? '✓' : ''}</span><span><strong>{item.title}</strong><small>{due} · {member?.name ?? 'Family'} · <b className="task-stars">★ {item.star_value ?? 1}</b></small></span><i className={`priority ${item.priority}`} /></button>;
    }) : <p className="empty-message">Your family to-do list is empty.</p>}</div>
  </section>;
}
