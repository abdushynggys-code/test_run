import { useState } from 'react';

interface Props {
  isDemo: boolean;
  onReset: () => Promise<void>;
}

export function FactoryResetControl({ isDemo, onReset }: Props) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const reset = async () => {
    if (confirmation !== 'RESET' || busy) return;
    setBusy(true); setError('');
    try { await onReset(); }
    catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Factory reset could not be completed.');
      setBusy(false);
    }
  };

  if (isDemo) return <p className="demo-note">Factory reset is unavailable in the temporary demo.</p>;
  if (step === 0) return <button className="factory-reset-button" onClick={() => setStep(1)}>Factory reset Kinboard</button>;

  return <div className="factory-reset-confirm" role="alert">
    <strong>{step === 1 ? 'Erase this family board?' : 'Final verification'}</strong>
    <p>{step === 1 ? 'This permanently removes events, tasks, reminders, profiles, stars, photos, and preferences. Your parent account stays active.' : 'Type RESET below. This cannot be undone.'}</p>
    {step === 2 && <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Type RESET" autoComplete="off" aria-label="Type RESET to confirm factory reset" />}
    {error && <p className="form-message">{error}</p>}
    <div>
      <button onClick={() => { setStep(0); setConfirmation(''); setError(''); }} disabled={busy}>Cancel</button>
      {step === 1 && <button className="danger-button" onClick={() => setStep(2)}>I understand, continue</button>}
      {step === 2 && <button className="danger-button" disabled={confirmation !== 'RESET' || busy} onClick={() => void reset()}>{busy ? 'Resetting…' : 'Erase and reset'}</button>}
    </div>
  </div>;
}
