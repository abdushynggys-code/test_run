import type { CalendarEvent, FamilyMember } from '../../types/family';
import { formatTime } from '../../lib/date';

type Segment = 'single' | 'start' | 'middle' | 'end';

export function EventPill({ event, member, onClick, segment, showLabel = true }: { event: CalendarEvent; member?: FamilyMember; onClick: () => void; segment?: Segment; showLabel?: boolean }) {
  const color = event.color ?? member?.color ?? '#78866b';
  return <button className={`event-pill ${segment ? `multi-day segment-${segment}` : ''}`} style={{ '--event-color': color } as React.CSSProperties} onClick={onClick}>{showLabel && <><span>{event.all_day ? 'All day' : formatTime(event.start_time)}</span>{event.title}</>}</button>;
}
