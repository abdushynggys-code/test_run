import { Route, Switch } from 'wouter';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LandingPage } from './pages/LandingPage';

export default function App() {
  return <Switch>
    <Route path="/" component={LandingPage} />
    <Route path="/dashboard"><DashboardPage /></Route>
    <Route path="/demo"><DashboardPage demoMode /></Route>
    <Route path="/login" component={AuthPage} />
    <Route component={NotFoundPage} />
  </Switch>;
}
