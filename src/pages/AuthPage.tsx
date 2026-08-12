import { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { useSession } from '../hooks/useSession';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';

type Mode = 'signin' | 'signup' | 'forgot';

export function AuthPage() {
  const { session } = useSession();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1_000);
    return () => window.clearInterval(timer);
  }, [cooldown > 0]);

  if (session) return <Redirect to="/" />;

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setMessage('');
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    const redirectTo = `${window.location.origin}/`;
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
      : mode === 'forgot'
        ? await supabase.auth.resetPasswordForEmail(email, { redirectTo })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) {
      const seconds = result.error.message.match(/after (\d+) seconds?/i)?.[1];
      if (seconds) { setCooldown(Number(seconds)); setMessage('Supabase limits repeated emails. You can still use Sign in now.'); }
      else if (/email not confirmed/i.test(result.error.message)) setMessage('Open the confirmation email first, then sign in.');
      else if (/invalid login credentials/i.test(result.error.message)) setMessage('Email or password is incorrect. New here? Choose Create account first.');
      else setMessage(result.error.message);
    } else if (mode !== 'signin') {
      setMessage(mode === 'signup' ? 'Account created. Check your email if confirmation is enabled, then use Sign in.' : 'Password reset link sent. Check your email.');
    }
  }

  const submitLabel = busy ? 'Please wait…' : mode !== 'signin' && cooldown > 0 ? `Try again in ${cooldown}s` : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link';
  return <main className="auth-page">
    <section className="auth-copy"><span className="brand-mark">K</span><p className="eyebrow">KINKEEP FAMILY</p><h1>Every plan. Everyone you love. One calm place.</h1><p>Your family calendar, reminders, and daily tasks stay clear at a glance.</p></section>
    <section className="auth-card">
      <p className="eyebrow">WELCOME HOME</p>
      {mode !== 'forgot' && <div className={`auth-tabs mode-${mode}`} role="tablist"><button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => changeMode('signin')}>Sign in</button><button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => changeMode('signup')}>Create account</button></div>}
      <div className={`auth-mode-content slide-${mode}`} key={mode}>
        <h2>{mode === 'signin' ? 'Sign in to your family' : mode === 'signup' ? 'Create your family' : 'Reset your password'}</h2>
        {mode !== 'forgot' && <><GoogleAuthButton onError={setMessage} /><div className="auth-divider"><span>or continue with email</span></div></>}
        <form onSubmit={submit} className="form-stack">
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="parent@example.com" required /></label>
          {mode !== 'forgot' && <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} placeholder="At least 6 characters" required /></label>}
          <button className="primary-button" disabled={busy || (mode !== 'signin' && cooldown > 0)}>{submitLabel}</button>
        </form>
        {message && <p className="form-message">{message}</p>}
        {mode === 'signup' && <button type="button" className="guest-button" onClick={() => navigate('/demo')}>Continue without an account<span>Open the demo — no email or Google needed</span></button>}
        <div className="auth-links">{mode === 'forgot' ? <button type="button" className="text-button" onClick={() => changeMode('signin')}>Back to sign in</button> : <span />}{mode === 'signin' && <button type="button" className="text-button" onClick={() => changeMode('forgot')}>Forgot password?</button>}</div>
      </div>
    </section>
  </main>;
}
