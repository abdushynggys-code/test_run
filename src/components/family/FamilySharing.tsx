import { useState } from 'react';

interface Props {
  inviteCode: string;
  isDemo: boolean;
  onJoin: (code: string) => Promise<void>;
  onRotate: () => Promise<void>;
}

export function FamilySharing({ inviteCode, isDemo, onJoin, onRotate }: Props) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [rotating, setRotating] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setMessage('Invite code copied.');
    } catch {
      setMessage(`Share this code: ${inviteCode}`);
    }
  };

  const join = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage('');
    try { await onJoin(code); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Could not join that family.'); }
    finally { setBusy(false); }
  };

  const rotate = async () => {
    setRotating(true); setMessage('');
    try { await onRotate(); setMessage('A new invite code is ready. The old code no longer works.'); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Could not replace the invite code.'); }
    finally { setRotating(false); }
  };

  if (isDemo) return <section className="family-sharing"><strong>Share across devices</strong><p>Create an account first, then invite another signed-in parent.</p></section>;
  return <section className="family-sharing">
    <div><strong>Add another parent</strong><p>They create their own account, then enter this code. Both accounts will use this calendar.</p></div>
    <div className="invite-code-row"><button type="button" className="invite-code" onClick={() => void copyCode()}><span>{inviteCode}</span><small>Copy invite code</small></button><button type="button" className="rotate-code" disabled={rotating} onClick={() => void rotate()}>{rotating ? 'Replacing…' : 'New code'}</button></div>
    <form onSubmit={(event) => void join(event)}>
      <label>Join a different family<input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Enter their code" minLength={10} maxLength={10} required /></label>
      <button className="secondary-button" disabled={busy}>{busy ? 'Joining…' : 'Join family'}</button>
    </form>
    {message && <p className="sharing-message" role="status">{message}</p>}
  </section>;
}
