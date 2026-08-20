import type { CalendarEvent, FamilyMember, Todo } from '../../types/family';
import type { WeatherSnapshot } from '../../lib/weather';
import { formatTime, toDateKey } from '../../lib/date';
import { DailyLeaderboard } from '../rewards/DailyLeaderboard';

interface Props {
  events: CalendarEvent[];
  todos: Todo[];
  members: FamilyMember[];
  weather: WeatherSnapshot | null;
  weatherLocation: string;
  onCalendar: () => void;
  onTodayCalendar: () => void;
  onTasks: () => void;
  onAddEvent: () => void;
  onToggleTodo: (todo: Todo) => void;
  onEvent: (event: CalendarEvent) => void;
  includeAdults: boolean;
  onProfiles: () => void;
}

const dayLabel = (value: string) => new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(value));
const taskDate = (value: string | null) => value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`)) : 'No due date';

export function HomeOverview(props: Props) {
  const { events, todos, members, weather, weatherLocation, onCalendar, onTodayCalendar, onTasks, onAddEvent, onToggleTodo, onEvent, includeAdults, onProfiles } = props;
  const now = new Date();
  const today = toDateKey(now);
  const upcoming = events.filter((event) => new Date(event.end_time) >= now).sort((a, b) => a.start_time.localeCompare(b.start_time)).slice(0, 6);
  const openTasks = todos.filter((todo) => !todo.completed).sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999')).slice(0, 6);
  const todayEvents = events.filter((event) => toDateKey(new Date(event.start_time)) === today).length;
  const dueToday = todos.filter((todo) => !todo.completed && todo.due_date === today).length;

  return <section className="home-overview">
    <header className="home-welcome">
      <div><p className="eyebrow">FAMILY OVERVIEW</p><h1>Here’s what’s coming up</h1><span>{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(now)}</span></div>
      <button className="primary-button" onClick={onAddEvent}>＋ Add event</button>
    </header>
    <div className="home-summary" data-tour="home-overview">
      <button type="button" onClick={onTodayCalendar} aria-label={`Open today's ${todayEvents} events in the calendar`}><span>◷</span><div><strong>{todayEvents}</strong><small>events today</small></div></button>
      <button type="button" onClick={onTasks} aria-label={`Open ${dueToday} tasks due today`}><span>✓</span><div><strong>{dueToday}</strong><small>tasks due today</small></div></button>
      <article><span>{weather?.icon ?? '○'}</span><div><strong>{weather ? `${weather.temperature}°` : '--'}</strong><small>{weatherLocation}</small></div></article>
    </div>
    <section className="home-panel weather-forecast-panel">
      <header><div><p className="eyebrow">WEATHER</p><h2>Next 7 days</h2></div><span>{weather?.label ?? 'Loading forecast…'}</span></header>
      <div className="weather-forecast-row">{weather?.forecast.slice(0, 7).map((day, index) => <article className={index === 0 ? 'today' : ''} key={day.date}><small>{index === 0 ? 'Today' : new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(`${day.date}T12:00:00`))}</small><b>{day.icon}</b><strong>{day.high}° <span>{day.low}°</span></strong></article>) ?? <p>Weather will appear here.</p>}</div>
    </section>
    <DailyLeaderboard members={members} todos={todos} includeAdults={includeAdults} onProfiles={onProfiles} />
    <div className="home-main-grid">
      <section className="home-panel upcoming-panel"><header><div><p className="eyebrow">CALENDAR</p><h2>Coming up</h2></div><button onClick={onCalendar}>View calendar</button></header>
        <div className="home-list">{upcoming.map((event) => { const member = members.find((item) => item.id === event.family_member_id); return <button key={event.id} onClick={() => onEvent(event)}><i style={{ background: event.color ?? member?.color ?? 'var(--accent)' }} /><time><strong>{dayLabel(event.start_time)}</strong><small>{event.all_day ? 'All day' : formatTime(event.start_time)}</small></time><span><strong>{event.title}</strong><small>{member?.name ?? 'Family'}{event.location ? ` · ${event.location}` : ''}</small></span><b>›</b></button>; })}{!upcoming.length && <p className="home-empty">Nothing scheduled yet.</p>}</div>
      </section>
      <section className="home-panel home-tasks-panel"><header><div><p className="eyebrow">TASKS</p><h2>Still to do</h2></div><button onClick={onTasks}>View tasks</button></header>
        <div className="home-list">{openTasks.map((todo) => { const member = members.find((item) => item.id === todo.family_member_id); return <button key={todo.id} onClick={() => onToggleTodo(todo)}><i style={{ background: member?.color ?? 'var(--accent)' }} /><span className="home-check">○</span><span><strong>{todo.title}</strong><small>{member?.name ?? 'Family'} · {taskDate(todo.due_date)}</small></span></button>; })}{!openTasks.length && <p className="home-empty">Everything is finished!</p>}</div>
      </section>
    </div>
  </section>;
}
