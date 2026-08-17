import { useState } from 'react';
import { createPortal } from 'react-dom';

const steps = [
  { icon: '⌂', title: 'Start on Home', text: 'See weather, upcoming dates, tasks, and today’s child leaderboard together.' },
  { icon: '□', title: 'Plan in Calendar', text: 'Switch Month, Week, or Day. Tap a date or the add button to schedule family plans.' },
  { icon: '★', title: 'Finish tasks, earn stars', text: 'Each task is worth 1–5 stars. Today’s winner wears the crown for a day.' },
  { icon: '✦', title: 'Ask Sidekick', text: 'Talk, type, or add a room photo. Sidekick can split chores fairly for you to approve.' },
];

export function OnboardingTour({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const item = steps[step];
  return createPortal(<div className="tour-backdrop" role="dialog" aria-modal="true" aria-labelledby="tour-title">
    <section className="tour-card">
      <button className="tour-skip" onClick={onFinish}>Skip</button>
      <div className="tour-icon">{item.icon}</div><p>QUICK TOUR · {step + 1} OF {steps.length}</p>
      <h2 id="tour-title">{item.title}</h2><span>{item.text}</span>
      <div className="tour-dots">{steps.map((_, index) => <i className={index === step ? 'active' : ''} key={index} />)}</div>
      <footer>{step > 0 ? <button className="secondary-button" onClick={() => setStep(step - 1)}>Back</button> : <span />}
        <button className="primary-button" onClick={() => step === steps.length - 1 ? onFinish() : setStep(step + 1)}>{step === steps.length - 1 ? 'Start planning' : 'Next'}</button>
      </footer>
    </section>
  </div>, document.body);
}
