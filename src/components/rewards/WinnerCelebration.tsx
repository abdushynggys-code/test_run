import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { RewardRank } from '../../lib/rewards';

interface Flight { x: number; y: number }
type MotionStyle = CSSProperties & Record<`--${string}`, string>;

const pieceStyle = (index: number): MotionStyle => ({
  '--piece-x': `${(index * 37 + 7) % 100}%`,
  '--piece-delay': `${-((index * 17) % 130) / 100}s`,
  '--piece-hue': `${(index * 53 + 18) % 360}`,
  '--piece-drift': `${(index % 2 ? 1 : -1) * (18 + index % 5 * 8)}px`,
});

const findProfile = (winnerId: string | undefined) =>
  [...document.querySelectorAll<HTMLElement>('[data-profile-id]')]
    .find((item) => item.dataset.profileId === winnerId);

export function WinnerCelebration({ winners, onClose }: { winners: RewardRank[]; onClose: () => void }) {
  const crownRef = useRef<HTMLDivElement>(null);
  const [flight, setFlight] = useState<Flight>({ x: 0, y: 0 });
  const [ending, setEnding] = useState(false);
  const winnerId = winners[0]?.member.id;

  useLayoutEffect(() => {
    const crown = crownRef.current;
    const target = findProfile(winnerId);
    if (!crown || !target) return;
    const start = crown.getBoundingClientRect();
    const finish = target.getBoundingClientRect();
    setFlight({
      x: finish.left + finish.width / 2 - start.left - start.width / 2,
      y: finish.top + finish.height / 2 - start.top - start.height / 2,
    });
  }, [winnerId]);

  useEffect(() => {
    if (!ending) return;
    const target = findProfile(winnerId);
    const arrival = window.setTimeout(() => target?.classList.add('crown-arrival'), 680);
    const close = window.setTimeout(onClose, 1050);
    return () => {
      window.clearTimeout(arrival);
      window.clearTimeout(close);
      target?.classList.remove('crown-arrival');
    };
  }, [ending, onClose, winnerId]);

  if (!winners.length) return null;
  const names = winners.map((winner) => winner.member.name).join(' & ');
  const style = { '--crown-flight-x': `${flight.x}px`, '--crown-flight-y': `${flight.y}px` } as MotionStyle;
  const finish = () => setEnding(true);

  return createPortal(<div className={`winner-celebration ${ending ? 'ending' : ''}`} role="dialog" aria-modal="true" aria-label="Daily winner" onClick={finish} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') finish(); }} tabIndex={0}>
    <div className="winner-confetti" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i style={pieceStyle(index)} key={index} />)}</div>
    <section className="winner-card">
      <div className="winner-crown" ref={crownRef} style={style} aria-hidden="true">👑</div>
      <p>Today&apos;s star champion</p>
      <h2>{names}</h2>
      <strong>★ {winners[0].stars} stars</strong>
      <button type="button" onClick={finish} disabled={ending}>{ending ? 'Awarding crown…' : 'Send crown to profile'}</button>
      <small>Tap anywhere when you&apos;re ready</small>
    </section>
  </div>, document.body);
}
