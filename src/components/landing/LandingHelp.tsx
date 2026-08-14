import { Link } from 'wouter';
import { Reveal } from './Reveal';

export function LandingHelp() {
  return <Reveal><section className="landing-help"><div><p className="eyebrow">READY TO GET ORGANIZED?</p><h2>Your family command center is only a minute away.</h2><p>Create one parent account, add family profiles, then ask Sidekick to help plan the week.</p></div><div className="help-actions"><Link href="/login?mode=signup" className="landing-signup">Create your family</Link><Link href="/demo" className="landing-login">Try the demo</Link></div></section></Reveal>;
}
