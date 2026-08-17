import type { FamilyMember } from '../../types/family';

export function TaskPassNotice({ members }: { members: FamilyMember[] }) {
  if (!members.length) return null;
  const names = members.map((member) => member.name).join(' & ');
  return <aside className="task-pass-notice" role="status">
    <span aria-hidden="true">🎟️</span>
    <div><strong>Level 20 task pass!</strong><small>{names} {members.length === 1 ? 'has' : 'have'} today off. Unfinished tasks return tomorrow.</small></div>
  </aside>;
}
