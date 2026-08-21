import { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';

const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })));
const JoinFamilyPage = lazy(() => import('./pages/JoinFamilyPage').then((module) => ({ default: module.JoinFamilyPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

export default function App() {
  return <Suspense fallback={<main className="loading-screen" aria-live="polite"><span className="brand-mark">K</span><p>Opening Kinboard…</p></main>}>
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard"><DashboardPage /></Route>
      <Route path="/demo"><DashboardPage demoMode /></Route>
      <Route path="/login" component={AuthPage} />
      <Route path="/join" component={JoinFamilyPage} />
      <Route component={NotFoundPage} />
    </Switch>
  </Suspense>;
}
