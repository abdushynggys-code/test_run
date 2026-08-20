import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { FamilyMember } from '../../types/family';

interface Props {
  member: FamilyMember;
  level: number;
  onClose: () => void;
}

export function LevelUpCelebration({ member, level, onClose }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3_200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return createPortal(<aside className="level-up-celebration" role="status" aria-live="polite">
    <div className="level-up-rings" aria-hidden="true"><i /><i /><i /></div>
    <span className="level-up-avatar" style={{ background: member.color }}>{member.avatar_url ? <img src={member.avatar_url} alt="" /> : member.emoji}</span>
    <p>Level up!</p>
    <strong>{member.name} reached level {level}</strong>
    <button type="button" onClick={onClose}>Awesome</button>
  </aside>, document.body);
}
