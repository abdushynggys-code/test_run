import { Link } from 'wouter';

export function LandingHeader() {
  return <header className="landing-header">
    <Link href="/" className="landing-brand"><span className="brand-mark small">K</span><strong>Kinkeep</strong></Link>
    <nav aria-label="Account"><Link href="/login" className="landing-login">Log in</Link><Link href="/login?mode=signup" className="landing-signup">Sign up</Link></nav>
  </header>;
}
