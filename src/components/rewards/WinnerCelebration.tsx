import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { RewardRank } from '../../lib/rewards';

export function WinnerCelebration({ winners, onClose }: { winners: RewardRank[]; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 5200);
    return () => window.clearTimeout(timer);
  }, [onClose]);
  if (!winners.length) return null;
  const names = winners.map((winner) => winner.member.name).join(' & ');
  return createPortal(<div className="winner-celebration" role="dialog" aria-modal="true" aria-label="Daily winner">
    <div className="confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
    <button onClick={onClose} aria-label="Close celebration">×</button>
    <div className="winner-crown">👑</div>
    <p>Today's star champion</p><h2>{names}</h2>
    <strong>★ {winners[0].stars} stars</strong>
    <span>The crown stays on the winning profile until tomorrow.</span>
  </div>, document.body);
}
