import type { FamilyMember, Reminder } from '../../types/family';
import { formatTime } from '../../lib/date';

export function ReminderPill({ reminder, member, onToggle }: { reminder: Reminder; member?: FamilyMember; onToggle: () => void }) {
  return <button className={`reminder-pill ${reminder.completed ? 'completed' : ''}`} style={{ '--reminder-color': member?.color ?? 'var(--accent)' } as React.CSSProperties} onClick={onToggle} title={`${formatTime(reminder.reminder_time)} · ${member?.name ?? 'Family'}`}>
    <span>{reminder.completed ? '✓' : '◷'}</span>{formatTime(reminder.reminder_time)} {reminder.title}
  </button>;
}
