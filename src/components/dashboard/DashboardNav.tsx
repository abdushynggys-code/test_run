import { playUiSound } from '../../lib/sounds';

export type DashboardSection = 'home' | 'calendar' | 'tasks';

interface Props {
  active: DashboardSection;
  onSection: (section: DashboardSection) => void;
  onSidekick: () => void;
  onSettings: () => void;
}

const items: Array<{ id: DashboardSection; icon: string; label: string }> = [
  { id: 'home', icon: '⌂', label: 'Home' },
  { id: 'calendar', icon: '▦', label: 'Calendar' },
  { id: 'tasks', icon: '✓', label: 'Tasks' },
];

export function DashboardNav({ active, onSection, onSidekick, onSettings }: Props) {
  const selectSection = (section: DashboardSection) => {
    playUiSound('click');
    onSection(section);
  };
  const openSidekick = () => { playUiSound('click'); onSidekick(); };
  const openSettings = () => { playUiSound('click'); onSettings(); };

  return <nav className="dashboard-nav" aria-label="Main navigation">
    <div className="nav-brand" aria-label="Kinboard">K</div>
    <div className="nav-main">{items.map((item) =>
      <button aria-current={active === item.id ? 'page' : undefined} className={active === item.id ? 'active' : ''} key={item.id} onClick={() => selectSection(item.id)}>
        <span>{item.icon}</span><small>{item.label}</small>
      </button>)}</div>
    <div className="nav-bottom">
      <button className="sidekick-nav-button" data-tour="sidekick" onClick={openSidekick}><span>✦</span><small>Sidekick</small></button>
      <button onClick={openSettings}><span>⚙</span><small>Settings</small></button>
    </div>
  </nav>;
}
