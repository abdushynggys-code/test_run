import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { RewardRank } from '../../lib/rewards';

interface Flight { x: number; y: number }
type MotionStyle = CSSProperties & Record<`--${string}`, string>;

const fallingPiece = (index: number): MotionStyle => ({
  '--piece-x': `${(index * 37 + 7) % 100}%`,
  '--piece-delay': `${-((index * 19) % 90) / 100}s`,
  '--piece-hue': `${(index * 53 + 18) % 360}`,
  '--piece-drift': `${(index % 2 ? 1 : -1) * (22 + index % 5 * 9)}px`,
});

const burstPiece = (index: number): MotionStyle => {
  const angle = index / 18 * Math.PI * 2;
  const distance = 145 + index % 4 * 24;
  return {
    '--burst-x': `${Math.round(Math.cos(angle) * distance)}px`,
    '--burst-y': `${Math.round(Math.sin(angle) * distance - 35)}px`,
    '--piece-hue': `${(index * 47 + 42) % 360}`,
    '--burst-delay': `${index % 4 * .035}s`,
  };
};

const findProfileTarget = (winnerId: string | undefined) =>
  [...document.querySelectorAll<HTMLElement>('[data-profile-id]')].find((item) => item.dataset.profileId === winnerId)
  ?? document.querySelector<HTMLElement>('.profile-stack');

export function WinnerCelebration({ winners, onClose }: { winners: RewardRank[]; onClose: () => void }) {
  const crownRef = useRef<HTMLDivElement>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const winnerId = winners[0]?.member.id;

  useLayoutEffect(() => {
    const crown = crownRef.current;
    if (!crown || !winnerId) return;
    const target = findProfileTarget(winnerId);
    const start = crown.getBoundingClientRect(); const finish = target?.getBoundingClientRect();
    setFlight(finish ? { x: finish.left + finish.width / 2 - start.left - start.width / 2, y: finish.top + finish.height / 2 - start.top - start.height / 2 } : { x: 0, y: -window.innerHeight * .42 });
  }, [winnerId]);

  useEffect(() => {
    const target = findProfileTarget(winnerId);
    const arrival = window.setTimeout(() => target?.classList.add('crown-arrival'), 4200);
    const clearArrival = window.setTimeout(() => target?.classList.remove('crown-arrival'), 5400);
    const close = window.setTimeout(onClose, 5500);
    return () => { window.clearTimeout(arrival); window.clearTimeout(clearArrival); window.clearTimeout(close); target?.classList.remove('crown-arrival'); };
  }, [onClose, winnerId]);

  if (!winners.length) return null;
  const names = winners.map((winner) => winner.member.name).join(' & ');
  const flightStyle = { '--crown-flight-x': `${flight?.x ?? 0}px`, '--crown-flight-y': `${flight?.y ?? 0}px` } as MotionStyle;
  return createPortal(<div className={`winner-celebration winner-story ${flight ? 'ready' : ''}`} role="dialog" aria-modal="true" aria-label="Daily winner">
    <button className="winner-close" onClick={onClose} aria-label="Close celebration">×</button>
    <div className="confetti-wave confetti-wave-one" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i style={fallingPiece(index)} key={index} />)}</div>
    <div className="winner-scene" aria-hidden="true">
      <div className="winner-impact" />
      <div className="confetti-wave confetti-wave-two">{Array.from({ length: 18 }, (_, index) => <i style={burstPiece(index)} key={index} />)}</div>
      <div className="winner-pedestal"><div className="winner-pillow"><i /><b /></div><div className="winner-pillar-face"><i /></div><div className="winner-pillar-base" /></div>
      <div className="winner-crown-flight" ref={crownRef} style={flightStyle}><span>👑</span><i /></div>
    </div>
    <section className="winner-story-copy"><p>Today's star champion</p><h2>{names}</h2><strong>★ {winners[0].stars} stars</strong><span>The crown is now on the winning profile until tomorrow.</span></section>
  </div>, document.body);
}
