import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useSession } from '../hooks/useSession';
import { familyApi } from '../lib/familyApi';
import { clearPendingInvite, normalizeInviteCode, rememberPendingInvite } from '../lib/invite';

export function JoinFamilyPage() {
  const { session, loading } = useSession();
  const [, navigate] = useLocation();
  const [message, setMessage] = useState('Connecting you to the shared calendar…');
  const started = useRef(false);
  const code = normalizeInviteCode(new URLSearchParams(window.location.search).get('code'));

  useEffect(() => {
    if (!code) return;
    rememberPendingInvite(code);
    if (!session || started.current) return;
    started.current = true;
    familyApi.joinFamily(code)
      .then(() => { clearPendingInvite(); navigate('/dashboard', { replace: true }); })
      .catch((reason: unknown) => {
        started.current = false;
        setMessage(reason instanceof Error ? reason.message : 'This invite could not be accepted.');
      });
  }, [code, navigate, session]);

  if (loading) return <main className="loading-screen"><p>Opening your invite…</p></main>;
  if (!code) return <main className="auth-page join-page"><section className="auth-card"><span className="brand-mark">K</span><h2>That invite link is invalid</h2><p>Ask the calendar admin to send you a new link.</p><Link className="primary-button join-link" href="/">Back to Kinboard</Link></section></main>;
  if (!session) return <main className="auth-page join-page"><section className="auth-card"><span className="brand-mark">K</span><p className="eyebrow">FAMILY INVITE</p><h2>Join one shared calendar</h2><p>Use your own account. After you join, Kinboard will remember this family calendar whenever you sign back in.</p><div className="join-actions"><Link className="primary-button" href={`/login?invite=${code}`}>Sign in</Link><Link className="secondary-button" href={`/login?mode=signup&invite=${code}`}>Create account</Link></div></section></main>;
  return <main className="loading-screen"><span className="brand-mark">K</span><p>{message}</p></main>;
}
