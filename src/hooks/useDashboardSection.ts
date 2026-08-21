import { useCallback, useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import type { DashboardSection } from '../components/dashboard/DashboardNav';

function readSection(search: string): DashboardSection {
  const section = new URLSearchParams(search).get('section');
  return section === 'calendar' || section === 'tasks' ? section : 'home';
}

export function useDashboardSection(demoMode: boolean, onHome: () => void) {
  const [, navigate] = useLocation();
  const search = useSearch();
  const [section, setSection] = useState<DashboardSection>(() => readSection(window.location.search));

  useEffect(() => setSection(readSection(search)), [search]);

  const changeSection = useCallback((next: DashboardSection) => {
    setSection(next);
    if (next === 'home') onHome();
    if (new URLSearchParams(window.location.search).get('section') !== next) navigate(`${demoMode ? '/demo' : '/dashboard'}?section=${next}`);
  }, [demoMode, navigate, onHome]);

  return { section, changeSection };
}
