import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getTourLayout, type TourLayout } from '../../lib/tourLayout';
import { TourIllustration, type TourArt } from './TourIllustration';

type TourSection = 'home' | 'calendar' | 'tasks';
interface Props { onFinish: () => void; onNavigate: (section: TourSection) => void }

const steps: Array<{ art: TourArt; icon: string; label: string; title: string; text: string; selector: string; section: TourSection }> = [
  { art: 'home', icon: '⌂', label: 'YOUR DAY', title: 'Start on Home', text: 'Weather, upcoming dates, tasks, and today’s leaderboard stay together here.', selector: '[data-tour="home-overview"]', section: 'home' },
  { art: 'calendar', icon: '▦', label: 'PLAN AHEAD', title: 'Choose your calendar view', text: 'Switch between Month, Week, and Day anytime—even on your phone.', selector: '[data-tour="calendar-views"]', section: 'calendar' },
  { art: 'tasks', icon: '★', label: 'EARN REWARDS', title: 'Finish tasks, collect stars', text: 'Every finished task adds stars. Today’s winning child wears the crown.', selector: '[data-tour="task-rewards"]', section: 'tasks' },
  { art: 'sidekick', icon: '✦', label: 'YOUR AI HELPER', title: 'Ask Sidekick', text: 'Talk, type, or add a photo. Sidekick explains it or prepares a plan for you to approve.', selector: '[data-tour="sidekick"]', section: 'home' },
];

export function OnboardingTour({ onFinish, onNavigate }: Props) {
  const [step, setStep] = useState(0);
  const [layout, setLayout] = useState<TourLayout | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const item = steps[step];

  const measure = useCallback(() => {
    const target = document.querySelector<HTMLElement>(item.selector);
    if (!target) return;
    const card = cardRef.current;
    setLayout(getTourLayout(target.getBoundingClientRect(), card?.offsetWidth ?? 0, card?.offsetHeight ?? 0, step));
  }, [item.selector, step]);

  useEffect(() => {
    onNavigate(item.section); setLayout(null);
    const timer = window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(item.selector);
      if (target) {
        const rect = target.getBoundingClientRect();
        if (rect.top < 8 || rect.bottom > window.innerHeight - 78) target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      measure(); window.requestAnimationFrame(() => { measure(); window.requestAnimationFrame(measure); });
    }, 90);
    window.addEventListener('resize', measure); window.addEventListener('scroll', measure, true);
    return () => { window.clearTimeout(timer); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [item.section, item.selector, measure, onNavigate]);

  const finish = () => { onNavigate('home'); onFinish(); };
  const move = (next: number) => setStep(Math.min(steps.length - 1, Math.max(0, next)));
  const cardStyle = layout ? { left: layout.card.left, top: layout.card.top, width: layout.card.width } : undefined;
  return createPortal(<div className={`tour-stage tour-step-${step} ${layout ? 'has-target' : ''}`} role="dialog" aria-modal="true" aria-labelledby="tour-title">
    {layout && <><div className="tour-spotlight" style={layout.spotlight} />
      <svg className={`tour-arrow tour-arrow-${layout.side}`} viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`} aria-hidden="true">
        <defs><marker id="tour-arrow-head" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" /></marker></defs>
        <path className="tour-arrow-line" d={layout.arrowPath} markerEnd="url(#tour-arrow-head)" />
        <circle r="4"><animateMotion dur="1.7s" repeatCount="indefinite" path={layout.arrowPath} /></circle>
      </svg></>}
    <section className={`tour-card ${layout ? 'placed' : ''}`} style={cardStyle} ref={cardRef} key={step}>
      <div className="tour-sparkles" aria-hidden="true"><i /><i /><i /></div>
      <button className="tour-skip" onClick={finish}>Skip tour</button>
      <header><div className="tour-icon"><i /><span>{item.icon}</span><b /></div><div><p>{item.label}</p><small>Step {step + 1} of {steps.length}</small></div></header>
      <TourIllustration kind={item.art} />
      <h2 id="tour-title">{item.title}</h2><p className="tour-copy">{item.text}</p>
      <div className="tour-dots">{steps.map((_, index) => <button aria-label={`Go to step ${index + 1}`} className={index === step ? 'active' : ''} key={index} onClick={() => move(index)} />)}</div>
      <footer>{step > 0 ? <button className="secondary-button" onClick={() => move(step - 1)}>Back</button> : <span />}
        <button className="primary-button" onClick={() => step === steps.length - 1 ? finish() : move(step + 1)}>{step === steps.length - 1 ? 'Start planning' : 'Show me'}</button>
      </footer>
    </section>
  </div>, document.body);
}
