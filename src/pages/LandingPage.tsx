import { Link } from 'wouter';
import { Benefits } from '../components/landing/Benefits';
import { CalendarPreview } from '../components/landing/CalendarPreview';
import { LandingHeader } from '../components/landing/LandingHeader';
import { LandingHelp } from '../components/landing/LandingHelp';
import { FeatureShowcase } from '../components/landing/FeatureShowcase';
import { Reveal } from '../components/landing/Reveal';

export function LandingPage() {
  return <main className="landing-page">
    <LandingHeader />
    <section className="landing-hero"><div className="hero-copy"><p className="eyebrow">YOUR FAMILY, ALL IN ONE PLACE</p><h1>Less juggling.<br /><em>More family time.</em></h1><p>A shared wall-style calendar with tasks, live weather, and an AI Sidekick that helps run the week.</p><div className="hero-actions"><Link href="/login?mode=signup" className="landing-signup large">Start your family board</Link><a href="#benefits" className="landing-login large">See how it helps ↓</a></div><small>No credit card · Kids do not need accounts</small></div><CalendarPreview /></section>
    <Benefits />
    <FeatureShowcase />
    <Reveal><section className="landing-steps"><p className="eyebrow">SIMPLE FROM DAY ONE</p><h2>Set up once. Plan together.</h2><div><article><b>1</b><span><strong>Create your family</strong><small>One parent account controls the board.</small></span></article><article><b>2</b><span><strong>Add profiles</strong><small>Give each person a name, photo, and color.</small></span></article><article><b>3</b><span><strong>Ask Sidekick</strong><small>Speak or type to plan events and tasks.</small></span></article></div></section></Reveal>
    <LandingHelp />
    <footer className="landing-footer"><span>Kinboard</span><small>A calmer way to run family life.</small><Link href="/login">Log in</Link></footer>
  </main>;
}
