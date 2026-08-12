import { useEffect, useMemo, useState } from 'react';
import { Redirect } from 'wouter';
import { useSession } from '../hooks/useSession';
import { useDashboard } from '../hooks/useDashboard';
import type { CalendarEvent, CalendarView } from '../types/family';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { CalendarToolbar } from '../components/calendar/CalendarToolbar';
import { MemberFilters } from '../components/calendar/MemberFilters';
import { MonthCalendar } from '../components/calendar/MonthCalendar';
import { WeekCalendar } from '../components/calendar/WeekCalendar';
import { DayCalendar } from '../components/calendar/DayCalendar';
import { RemindersPanel } from '../components/dashboard/RemindersPanel';
import { TodosPanel } from '../components/dashboard/TodosPanel';
import { FamilyPopover } from '../components/family/FamilyPopover';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { Modal } from '../components/ui/Modal';
import { EventForm } from '../components/forms/EventForm';
import { ReminderForm } from '../components/forms/ReminderForm';
import { TodoForm } from '../components/forms/TodoForm';
import { EventDetails } from '../components/events/EventDetails';

type Dialog = 'event' | 'reminder' | 'todo' | null;

export function DashboardPage({ demoMode = false }: { demoMode?: boolean }) {
  const auth = useSession();
  const session = demoMode ? null : auth.session;
  const loading = demoMode ? false : auth.loading;
  const isDemo = demoMode || auth.isDemo;
  const dashboard = useDashboard(session, isDemo);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<Dialog>(null);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [showFamily, setShowFamily] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const data = dashboard.data;

  useEffect(() => { if (data) { setView(data.settings.default_view); setSelected(new Set(data.members.map((member) => member.id))); } }, [data?.family.id]);
  useEffect(() => {
    if (!data) return;
    document.documentElement.style.setProperty('--accent', data.settings.accent_color);
    document.documentElement.dataset.theme = data.settings.mode;
  }, [data?.settings]);

  const visibleEvents = useMemo(() => data?.events.filter((event) => !event.family_member_id || selected.has(event.family_member_id)) ?? [], [data?.events, selected]);
  if (loading) return <main className="loading-screen"><span className="brand-mark">K</span><p>Opening your family dashboard…</p></main>;
  if (!isDemo && !session) return <Redirect to="/login" />;
  if (!data) return <main className="loading-screen"><p>{dashboard.error || 'Loading family…'}</p></main>;

  const changeView = (next: CalendarView) => { setView(next); void dashboard.saveSettings({ default_view: next }); };
  const openDay = (next: Date) => { setDate(next); changeView('day'); };
  return <main className="dashboard-shell">
    <DashboardHeader familyName={data.family.name} members={data.members} settings={data.settings} isDemo={isDemo} onFamily={() => setShowFamily(!showFamily)} onSettings={() => setShowSettings(true)} />
    {showFamily && <FamilyPopover members={data.members} onAdd={(value) => { void dashboard.addMember(value); }} onClose={() => setShowFamily(false)} />}
    {showSettings && <><div className="drawer-backdrop" onClick={() => setShowSettings(false)} /><SettingsPanel settings={data.settings} isDemo={isDemo} onSave={(value) => void dashboard.saveSettings(value)} onClose={() => setShowSettings(false)} /></>}
    {dashboard.error && <p className="error-banner">{dashboard.error}</p>}
    <section className="calendar-card">
      <CalendarToolbar date={date} view={view} onDate={setDate} onView={changeView} onAdd={() => setDialog('event')} />
      <MemberFilters members={data.members} selected={selected} onChange={setSelected} />
      {view === 'month' && <MonthCalendar date={date} events={visibleEvents} members={data.members} firstDay={data.settings.first_day_of_week} onDay={openDay} onEvent={setActiveEvent} />}
      {view === 'week' && <WeekCalendar date={date} events={visibleEvents} members={data.members} firstDay={data.settings.first_day_of_week} onEvent={setActiveEvent} />}
      {view === 'day' && <DayCalendar date={date} events={visibleEvents} members={data.members} onEvent={setActiveEvent} />}
    </section>
    <div className="bottom-grid"><RemindersPanel items={data.reminders} members={data.members} onAdd={() => setDialog('reminder')} onToggle={(id, completed) => void dashboard.toggleItem('reminders', id, completed)} /><TodosPanel items={data.todos} members={data.members} onAdd={() => setDialog('todo')} onToggle={(id, completed) => void dashboard.toggleItem('todos', id, completed)} /></div>
    {dialog === 'event' && <Modal title="Add an event" onClose={() => setDialog(null)}><EventForm members={data.members} initialDate={date} onCancel={() => setDialog(null)} onSubmit={(value) => { void dashboard.addEvent(value); setDialog(null); }} /></Modal>}
    {dialog === 'reminder' && <Modal title="Add a reminder" onClose={() => setDialog(null)}><ReminderForm members={data.members} onCancel={() => setDialog(null)} onSubmit={(value) => { void dashboard.addReminder(value); setDialog(null); }} /></Modal>}
    {dialog === 'todo' && <Modal title="Add a family task" onClose={() => setDialog(null)}><TodoForm members={data.members} onCancel={() => setDialog(null)} onSubmit={(value) => { void dashboard.addTodo(value); setDialog(null); }} /></Modal>}
    {activeEvent && <Modal title="Event details" onClose={() => setActiveEvent(null)}><EventDetails event={activeEvent} members={data.members} onClose={() => setActiveEvent(null)} onDelete={() => { void dashboard.removeItem('events', activeEvent.id); setActiveEvent(null); }} /></Modal>}
  </main>;
}
