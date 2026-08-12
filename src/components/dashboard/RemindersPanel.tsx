import type { FamilyMember, Reminder } from '../../types/family';
import { formatTime } from '../../lib/date';

export function RemindersPanel({ items, members, onAdd, onToggle }: { items: Reminder[]; members: FamilyMember[]; onAdd: () => void; onToggle: (id: string, completed: boolean) => void }) {
  return <section className="bottom-panel"><header><div><p className="eyebrow">DON'T FORGET</p><h2>Reminders</h2></div><button className="panel-add" onClick={onAdd}>＋ Add</button></header>
    <div className="compact-list">{items.length ? items.slice(0, 4).map((item) => { const member = members.find((entry) => entry.id === item.family_member_id); return <button className={`compact-item ${item.completed ? 'completed' : ''}`} key={item.id} onClick={() => onToggle(item.id, !item.completed)}><span className="round-check">{item.completed ? '✓' : ''}</span><span><strong>{item.title}</strong><small>{formatTime(item.reminder_time)} · {member?.name ?? 'Family'}</small></span><i className={`priority ${item.priority}`} /></button>; }) : <p className="empty-message">You’re all caught up!</p>}</div>
  </section>;
}
