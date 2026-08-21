import { useCallback, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { Redirect } from 'wouter';
import { useSession } from '../hooks/useSession';
import { useDashboard } from '../hooks/useDashboard';
import { useWeather } from '../hooks/useWeather';
import type { CalendarEvent, CalendarView, FamilyMember, Todo } from '../types/family';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardNav } from '../components/dashboard/DashboardNav';
import { TasksBoard } from '../components/dashboard/TasksBoard';
import { CalendarToolbar, DayCalendar, MemberFilters, MonthCalendar, WeekCalendar } from '../components/calendar';
import { HomeOverview } from '../components/dashboard/HomeOverview';
import { WeatherLocationPrompt } from '../components/dashboard/WeatherLocationPrompt';
import { FamilyPopover } from '../components/family/FamilyPopover';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { Modal } from '../components/ui/Modal';
import { EventForm, ReminderForm, TodoForm } from '../components/forms';
import { EventDetails } from '../components/events/EventDetails';
import { SidekickPanel } from '../components/sidekick/SidekickPanel';
import type { SidekickAction } from '../lib/sidekick';
import { dailyLeaderboard, taskPassMembers, todosDuringTaskPass, type RewardRank } from '../lib/rewards';
import { WinnerCelebration } from '../components/rewards/WinnerCelebration';
import { TaskPassNotice } from '../components/rewards/TaskPassNotice';
import { OnboardingTour } from '../components/onboarding/OnboardingTour';
import { toDateKey } from '../lib/date';
import { taskCompletionRewards } from '../lib/taskCompletionRewards';
import { playUiSound } from '../lib/sounds';
import { triggerHaptic } from '../lib/haptics';
import { LevelUpCelebration } from '../components/rewards/LevelUpCelebration';
import { useDashboardSection } from '../hooks/useDashboardSection';
type Dialog = 'event' | 'reminder' | 'todo' | null;
export function DashboardPage({ demoMode = false }: { demoMode?: boolean }) {
  const auth = useSession();
  const session = demoMode ? null : auth.session;
  const loading = demoMode ? false : auth.loading;
  const isDemo = demoMode || auth.isDemo;
  const dashboard = useDashboard(session, isDemo);
  const [date, setDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [calendarOwner, setCalendarOwner] = useState<string | null>(null);
  const [eventRange, setEventRange] = useState<{ start: Date; end: Date } | null>(null);
  const [motion, setMotion] = useState<'forward' | 'backward' | 'fade'>('fade');
  const [motionKey, setMotionKey] = useState(0);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [showFamily, setShowFamily] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tourFamily, setTourFamily] = useState<string | null>(null);
  const [celebrationWinners, setCelebrationWinners] = useState<RewardRank[]>([]);
  const [levelUp, setLevelUp] = useState<{ member: FamilyMember; level: number } | null>(null);
  const [showSidekick, setShowSidekick] = useState(() => new URLSearchParams(window.location.search).get('sidekick') === 'open');
  const resetHomeDate = useCallback(() => setDate(new Date()), []);
  const { section, changeSection } = useDashboardSection(demoMode, resetHomeDate);
  const data = dashboard.data;
  const view = calendarView;
  const weather = useWeather(data?.settings.weather_location ?? 'Almaty', data?.settings.temperature_unit ?? 'c', data?.settings.weather_latitude ?? null, data?.settings.weather_longitude ?? null);
  useEffect(() => { if (data) { setCalendarView(data.settings.calendar_view); setSelected(new Set(data.members.map((member) => member.id))); } }, [data?.family.id]);
  useEffect(() => { if (data && !data.settings.tutorial_completed && tourFamily !== data.family.id) { setTourFamily(data.family.id); setShowTutorial(true); } }, [data, tourFamily]);
  const passMembers = useMemo(() => data ? taskPassMembers(data.members) : [], [data]);
  const availableTodos = useMemo(() => data ? todosDuringTaskPass(data.todos, data.members) : [], [data]);
  const visibleEvents = useMemo(() => data?.events.filter((event) => calendarOwner ? event.family_member_id === calendarOwner : !event.family_member_id || selected.has(event.family_member_id)) ?? [], [calendarOwner, data?.events, selected]);
  const visibleTodos = useMemo(() => availableTodos.filter((todo) => calendarOwner ? todo.family_member_id === calendarOwner : !todo.family_member_id || selected.has(todo.family_member_id)), [availableTodos, calendarOwner, selected]);
  const visibleReminders = useMemo(() => data?.reminders.filter((item) => calendarOwner ? item.family_member_id === calendarOwner : !item.family_member_id || selected.has(item.family_member_id)) ?? [], [calendarOwner, data?.reminders, selected]);
  const ranks = useMemo(() => data ? dailyLeaderboard(data.members, data.todos, data.settings.leaderboard_include_adults) : [], [data]);
  const winnerIds = useMemo(() => new Set(ranks.filter((rank) => rank.isWinner).map((rank) => rank.member.id)), [ranks]);
  const displayedWinnerIds = useMemo(() => new Set([...winnerIds, ...celebrationWinners.map((rank) => rank.member.id)]), [celebrationWinners, winnerIds]);
  const closeCelebration = useCallback(() => setCelebrationWinners([]), []);
  if (loading) return <main className="loading-screen"><span className="brand-mark">K</span><p>Opening your family dashboard…</p></main>;
  if (!isDemo && !session) return <Redirect to="/" />;
  if (!data) return <main className="loading-screen"><p>{dashboard.error || 'Loading family…'}</p></main>;
  const animate = (nextMotion: 'forward' | 'backward' | 'fade') => { setMotion(nextMotion); setMotionKey((key) => key + 1); };
  const transitionCalendar = (nextMotion: 'forward' | 'backward' | 'fade', update: () => void) => {
    const transition = document.startViewTransition;
    if (!transition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { animate(nextMotion); update(); return; }
    document.documentElement.dataset.calendarMotion = nextMotion;
    const running = transition.call(document, () => flushSync(() => { animate(nextMotion); update(); }));
    void running.finished.finally(() => { delete document.documentElement.dataset.calendarMotion; });
  };
  const navigateDate = (next: Date, direction: -1 | 0 | 1) => transitionCalendar(direction > 0 ? 'forward' : direction < 0 ? 'backward' : 'fade', () => setDate(next));
  const changeView = (next: CalendarView) => {
    const order: CalendarView[] = ['month', 'week', 'day'];
    const nextMotion = order.indexOf(next) > order.indexOf(view) ? 'forward' : order.indexOf(next) < order.indexOf(view) ? 'backward' : 'fade';
    transitionCalendar(nextMotion, () => setCalendarView(next));
    void dashboard.saveSettings({ calendar_view: next });
  };
  const changeCalendarOwner = (id: string | null) => { animate('fade'); setCalendarOwner(id); };
  const openDay = (next: Date) => { setDate(next); changeView('day'); };
  const openRange = (start: Date, end: Date) => { setDate(start); setEventRange({ start, end }); setDialog('event'); };
  const openEventForDate = (next: Date) => { setDate(next); setEventRange(null); setDialog('event'); };
  const saveSettings = (value: Partial<typeof data.settings>) => {
    if (value.calendar_view) setCalendarView(value.calendar_view);
    void dashboard.saveSettings(value);
  };
  const validMember = (id: string | null) => data.members.some((member) => member.id === id) ? id : null;
  const toggleTodo = (todo: Todo) => {
    const completed = !todo.completed;
    if (completed) {
      const rewards = taskCompletionRewards(todo, data.todos, data.members, data.settings.leaderboard_include_adults, winnerIds);
      if (rewards.newlyCrowned.length || rewards.levelUp) playUiSound('reward');
      if (rewards.newlyCrowned.length) triggerHaptic('crown');
      else if (rewards.levelUp) triggerHaptic('level-up');
      setCelebrationWinners(rewards.newlyCrowned);
      setLevelUp(rewards.levelUp);
      if (rewards.passMember) void dashboard.grantLevel20Pass(rewards.passMember.id, toDateKey(new Date()));
    }
    void dashboard.toggleItem('todos', todo.id, completed);
  };
  const applySidekickAction = (action: SidekickAction) => {
    if (action.type === 'create_todo' && action.title) { playUiSound('click'); void dashboard.addTodo({ title: action.title, description: '', family_member_id: validMember(action.memberId), due_date: action.dueDate, priority: action.priority, star_value: action.starValue }); }
    if (action.type === 'create_todos') { playUiSound('click'); action.items.forEach((item) => { const memberId = data.members.some((member) => member.id === item.memberId && member.member_type === 'child') ? item.memberId : null; void dashboard.addTodo({ title: item.title, description: 'Suggested from a room photo by Sidekick', family_member_id: memberId, due_date: item.dueDate, priority: item.priority, star_value: item.starValue }); }); }
    if (action.type === 'complete_todo') { const todo = data.todos.find((item) => item.id === action.todoId); if (todo && !todo.completed) toggleTodo(todo); }
    if (action.type === 'delete_todo' && data.todos.some((todo) => todo.id === action.todoId)) void dashboard.removeItem('todos', action.todoId);
    if (action.type === 'delete_event' && data.events.some((event) => event.id === action.eventId)) void dashboard.removeItem('events', action.eventId);
    if (action.type === 'create_event' && action.title && new Date(action.endTime) > new Date(action.startTime)) void dashboard.addEvent({ title: action.title, description: '', start_time: action.startTime, end_time: action.endTime, all_day: false, location: action.location, family_member_id: validMember(action.memberId), color: null, repeat_rule: 'none' });
  };
  return <main className="dashboard-shell">
    <DashboardNav active={section} onSection={changeSection} onSidekick={() => setShowSidekick(true)} onSettings={() => setShowSettings(true)} />
    <div className="dashboard-workspace">
    <DashboardHeader familyName={data.family.name} members={data.members} settings={data.settings} weather={weather} isDemo={isDemo} winnerIds={displayedWinnerIds} onFamily={() => setShowFamily(!showFamily)} onInvite={() => setShowFamily(true)} onSidekick={() => setShowSidekick(true)} />
    {section === 'home' && <WeatherLocationPrompt settings={data.settings} onSave={saveSettings} />}
    {showFamily && <><div className="popover-backdrop" onClick={() => setShowFamily(false)} /><FamilyPopover members={data.members} todos={data.todos} winnerIds={displayedWinnerIds} inviteCode={data.family.join_code} currentUserId={session?.user.id ?? null} isDemo={isDemo} isOwner={isDemo || data.accountRole === 'owner'} onAdd={(value, file) => { void dashboard.addMember(value, file); }} onAvatar={(id, file) => void dashboard.updateMemberAvatar(id, file)} onColor={(id, color) => void dashboard.updateMemberColor(id, color)} onName={(id, name) => void dashboard.updateMemberName(id, name)} onRemove={(id) => void dashboard.removeMember(id)} onJoin={async (code) => { await dashboard.joinFamily(code); setShowFamily(false); }} onRotate={dashboard.rotateInviteCode} onClose={() => setShowFamily(false)} /></>}
    {showSettings && <><div className="drawer-backdrop" onClick={() => setShowSettings(false)} /><SettingsPanel settings={data.settings} isDemo={isDemo} isOwner={isDemo || data.accountRole === 'owner'} onSave={saveSettings} onTutorial={() => { setShowSettings(false); setShowTutorial(true); }} onFactoryReset={async () => { await dashboard.factoryReset(); setShowSettings(false); setShowTutorial(true); }} onClose={() => setShowSettings(false)} /></>}
    {dashboard.error && <p className="error-banner">{dashboard.error}</p>}
    <TaskPassNotice members={passMembers} />
    {section === 'home' && <HomeOverview events={data.events} todos={availableTodos} members={data.members} weather={weather} weatherLocation={data.settings.weather_location} includeAdults={data.settings.leaderboard_include_adults} onProfiles={() => setShowFamily(true)} onCalendar={() => changeSection('calendar')} onTodayCalendar={() => { setDate(new Date()); setCalendarView('day'); changeSection('calendar'); }} onTasks={() => changeSection('tasks')} onAddEvent={() => { setEventRange(null); setDialog('event'); }} onToggleTodo={toggleTodo} onEvent={setActiveEvent} />}
    {section === 'calendar' && <section className="calendar-card">
      <CalendarToolbar date={date} view={view} members={data.members} scopeId={calendarOwner} onScope={changeCalendarOwner} onDate={navigateDate} onView={changeView} onAdd={(kind) => { setEventRange(null); setDialog(kind); }} />
      {!calendarOwner && <div className="fixed-member-filters"><MemberFilters members={data.members} selected={selected} onChange={setSelected} /></div>}
      <div className="calendar-viewport"><div className={`calendar-content motion-${motion}`} key={`${calendarOwner ?? 'family'}-${view}-${motionKey}`}>
        {view === 'month' && <MonthCalendar date={date} events={visibleEvents} todos={visibleTodos} reminders={visibleReminders} members={data.members} firstDay={data.settings.first_day_of_week} onDay={openDay} onRange={openRange} onEvent={setActiveEvent} onTodo={toggleTodo} onReminder={(reminder) => void dashboard.toggleItem('reminders', reminder.id, !reminder.completed)} />}
        {view === 'week' && <WeekCalendar date={date} events={visibleEvents} todos={visibleTodos} reminders={visibleReminders} members={data.members} weather={weather?.forecast ?? []} firstDay={data.settings.first_day_of_week} onEvent={setActiveEvent} onTodo={toggleTodo} onReminder={(reminder) => void dashboard.toggleItem('reminders', reminder.id, !reminder.completed)} onAddEvent={openEventForDate} />}
        {view === 'day' && <DayCalendar date={date} events={visibleEvents} todos={visibleTodos} reminders={visibleReminders} members={data.members} onEvent={setActiveEvent} onTodo={toggleTodo} onReminder={(item) => void dashboard.toggleItem('reminders', item.id, !item.completed)} />}
      </div></div>
    </section>}
    {section === 'tasks' && <TasksBoard todos={visibleTodos} members={data.members} onToggle={toggleTodo} onAdd={() => setDialog('todo')} />}
    {dialog === 'event' && <Modal title={eventRange ? "Add a multi-day event" : "Add an event"} onClose={() => { setDialog(null); setEventRange(null); }}><EventForm members={data.members} initialDate={eventRange?.start ?? date} initialEndDate={eventRange?.end} initialMemberId={calendarOwner} onCancel={() => { setDialog(null); setEventRange(null); }} onSubmit={(value) => { void dashboard.addEvent(value); setDialog(null); setEventRange(null); }} /></Modal>}
    {dialog === 'reminder' && <Modal title="Add a reminder" onClose={() => setDialog(null)}><ReminderForm members={data.members} onCancel={() => setDialog(null)} onSubmit={(value) => { void dashboard.addReminder(value); setDialog(null); }} /></Modal>}
    {dialog === 'todo' && <Modal title="Add a family task" onClose={() => setDialog(null)}><TodoForm members={data.members} onCancel={() => setDialog(null)} onSubmit={(value) => { playUiSound('click'); void dashboard.addTodo(value); setDialog(null); }} /></Modal>}
    {activeEvent && <Modal title="Event details" onClose={() => setActiveEvent(null)}><EventDetails event={activeEvent} members={data.members} onClose={() => setActiveEvent(null)} onDelete={() => { void dashboard.removeItem('events', activeEvent.id); setActiveEvent(null); }} /></Modal>}
    </div>
    {!showSidekick && <button className="sidekick-fab" onClick={() => setShowSidekick(true)}><span>✦</span><strong>Ask Sidekick</strong><small>Plan with AI</small></button>}
    <SidekickPanel open={showSidekick} members={data.members} todos={data.todos} events={data.events} weather={weather} weatherLocation={data.settings.weather_location} onClose={() => setShowSidekick(false)} onApply={applySidekickAction} onUploadPhoto={dashboard.uploadRoomPhoto} />
    {celebrationWinners.length > 0 && <WinnerCelebration winners={celebrationWinners} onClose={closeCelebration} />}
    {levelUp && celebrationWinners.length === 0 && <LevelUpCelebration member={levelUp.member} level={levelUp.level} onClose={() => setLevelUp(null)} />}
    {showTutorial && <OnboardingTour onNavigate={changeSection} onFinish={() => { setShowTutorial(false); saveSettings({ tutorial_completed: true }); }} />}
  </main>;
}
