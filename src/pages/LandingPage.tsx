import { Link } from 'wouter';
import { Benefits } from '../components/landing/Benefits';
import { CalendarPreview } from '../components/landing/CalendarPreview';
import { LandingHeader } from '../components/landing/LandingHeader';
import { LandingHelp } from '../components/landing/LandingHelp';

export function LandingPage() {
  return <main className="landing-page">
    <LandingHeader />
    <section className="landing-hero"><div className="hero-copy"><p className="eyebrow">YOUR FAMILY, IN SYNC</p><h1>Know what’s next.<br /><em>Without asking twice.</em></h1><p>One calm place for your family’s calendar, reminders, and everyday tasks.</p><div className="hero-actions"><Link href="/login?mode=signup" className="landing-signup large">Start your family calendar</Link><a href="#benefits" className="landing-login large">See how it helps ↓</a></div><small>No credit card · Kids don’t need accounts</small></div><CalendarPreview /></section>
    <Benefits />
    <section className="landing-steps"><p className="eyebrow">SIMPLE FROM DAY ONE</p><h2>Set up once. See everything.</h2><div><article><b>1</b><span><strong>Create your family</strong><small>One parent account controls the dashboard.</small></span></article><article><b>2</b><span><strong>Add profiles</strong><small>Give each person a name, photo, and color.</small></span></article><article><b>3</b><span><strong>Plan together</strong><small>Add events, reminders, and assigned tasks.</small></span></article></div></section>
    <LandingHelp />
    <footer className="landing-footer"><span>Kinkeep</span><small>A calmer way to run family life.</small><Link href="/login">Log in</Link></footer>
  </main>;
}
