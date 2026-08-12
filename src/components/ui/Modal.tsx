import { useEffect, type ReactNode } from 'react';

interface Props { title: string; children: ReactNode; onClose: () => void; }

export function Modal({ title, children, onClose }: Props) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header><div><p className="eyebrow">KINKEEP</p><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></header>
        {children}
      </section>
    </div>
  );
}
