import type { CalendarView, FamilyMember } from '../../types/family';
import { CalendarPicker } from './CalendarPicker';

interface Props { date: Date; view: CalendarView; members: FamilyMember[]; scopeId: string | null; onScope: (id: string | null) => void; onDate: (date: Date, direction: -1 | 0 | 1) => void; onView: (view: CalendarView) => void; onAdd: () => void; }

export function CalendarToolbar({ date, view, members, scopeId, onScope, onDate, onView, onAdd }: Props) {
  const move = (amount: number) => {
    const next = new Date(date);
    if (view === 'month') next.setMonth(next.getMonth() + amount);
    else next.setDate(next.getDate() + amount * (view === 'week' ? 7 : 1));
    onDate(next, amount < 0 ? -1 : 1);
  };
  const title = view === 'day' ? new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date) : new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date);
  return <div className="calendar-toolbar">
    <div className="calendar-title"><div><p className="eyebrow">CHOOSE A CALENDAR</p><CalendarPicker members={members} selectedId={scopeId} onChange={onScope} /></div><button className="primary-button add-event-mobile" onClick={onAdd}>＋ Add event</button></div>
    <div className="calendar-controls"><button className="secondary-button" onClick={() => onDate(new Date(), 0)}>Today</button><button className="arrow-button" onClick={() => move(-1)} aria-label="Previous">‹</button><h2>{title}</h2><button className="arrow-button" onClick={() => move(1)} aria-label="Next">›</button><div className={`segmented view-${view}`} aria-label="Calendar view">{(['month', 'week', 'day'] as CalendarView[]).map((item) => <button className={view === item ? 'active' : ''} key={item} onClick={() => onView(item)}>{item}</button>)}</div><button className="primary-button add-event-desktop" onClick={onAdd}>＋ Add event</button></div>
  </div>;
}
