import { useState } from 'react';
import { inviteUrl } from '../../lib/invite';

interface Props {
  inviteCode: string;
  isDemo: boolean;
  isOwner: boolean;
  onJoin: (code: string) => Promise<void>;
  onRotate: () => Promise<void>;
}

export function FamilySharing({ inviteCode, isDemo, isOwner, onJoin, onRotate }: Props) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [rotating, setRotating] = useState(false);

  const shareInvite = async () => {
    const url = inviteUrl(inviteCode);
    const canShare = typeof navigator.share === 'function';
    try {
      if (canShare) await navigator.share({ title: 'Join our Kinboard calendar', text: 'Use your own account to join our shared family calendar.', url });
      else await navigator.clipboard.writeText(url);
      setMessage(canShare ? 'Invite ready to send.' : 'Invite link copied.');
    } catch {
      setMessage(`Copy this invite link: ${url}`);
    }
  };

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(inviteCode); setMessage('Backup code copied.'); }
    catch { setMessage(`Backup code: ${inviteCode}`); }
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
    <div><strong>Invite another parent</strong><p>Send the link to Mom or Dad. They use their own account, and Kinboard remembers this shared calendar after logout.</p></div>
    <button type="button" className="primary-button share-invite-button" onClick={() => void shareInvite()}>Send invite link</button>
    <div className="invite-code-row"><button type="button" className="invite-code" onClick={() => void copyCode()}><span>{inviteCode}</span><small>Backup code</small></button>{isOwner && <button type="button" className="rotate-code" disabled={rotating} onClick={() => void rotate()}>{rotating ? 'Replacing…' : 'New link'}</button>}</div>
    {!isOwner && <p>Only the calendar admin can replace the invite link.</p>}
    <form onSubmit={(event) => void join(event)}>
      <label>Join a different family<input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Enter their code" minLength={10} maxLength={10} required /></label>
      <button className="secondary-button" disabled={busy}>{busy ? 'Joining…' : 'Join family'}</button>
    </form>
    {message && <p className="sharing-message" role="status">{message}</p>}
  </section>;
}
