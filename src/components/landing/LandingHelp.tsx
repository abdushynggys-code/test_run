import { Link } from 'wouter';
import { Reveal } from './Reveal';

export function LandingHelp() {
  return <Reveal><section className="landing-help"><div><p className="eyebrow">NEED HELP GETTING STARTED?</p><h2>Your family command center is only a minute away.</h2><p>Create one parent account, add your family profiles, then begin with your first event or task.</p></div><div className="help-actions"><Link href="/login?mode=signup" className="landing-signup">Create your family</Link><a href="mailto:help@kinkeep.app" className="landing-login">Contact help</a></div></section></Reveal>;
}
