import { useState } from 'react';

export type AddKind = 'event' | 'reminder' | 'todo';

const choices: { kind: AddKind; icon: string; title: string; detail: string }[] = [
  { kind: 'event', icon: '□', title: 'Event', detail: 'Add something to the calendar' },
  { kind: 'reminder', icon: '◷', title: 'Reminder', detail: 'Remember something at a time' },
  { kind: 'todo', icon: '✓', title: 'To-do', detail: 'Create task' },
];

export function AddMenu({ mobile = false, onSelect }: { mobile?: boolean; onSelect: (kind: AddKind) => void }) {
  const [open, setOpen] = useState(false);
  const choose = (kind: AddKind) => { setOpen(false); onSelect(kind); };
  return <div className={`add-menu-wrap ${mobile ? 'add-event-mobile' : 'add-event-desktop'}`}>
    <button className="primary-button" onClick={() => setOpen(!open)} aria-expanded={open}>＋ Add</button>
    {open && <><button className="add-menu-backdrop" aria-label="Close add menu" onClick={() => setOpen(false)} /><div className="add-menu">
      {choices.map((choice) => <button key={choice.kind} onClick={() => choose(choice.kind)}><span>{choice.icon}</span><strong>{choice.title}<small>{choice.detail}</small></strong></button>)}
    </div></>}
  </div>;
}
