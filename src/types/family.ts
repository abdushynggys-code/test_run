export type CalendarView = 'month' | 'week' | 'day';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ThemePalette {
  primary: string;
  dark: string;
  light: string;
  warm: string;
  deep: string;
}

export interface SavedPalette {
  id: string;
  name: string;
  colors: ThemePalette;
}

export interface Family {
  id: string;
  name: string;
  owner_id: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  name: string;
  avatar_url: string | null;
  color: string;
  emoji: string;
  member_type: 'adult' | 'child' | 'group';
  active: boolean;
}

export interface CalendarEvent {
  id: string;
  family_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location: string;
  family_member_id: string | null;
  color: string | null;
  repeat_rule: string;
}

export interface Reminder {
  id: string;
  family_id: string;
  title: string;
  description: string;
  reminder_time: string;
  family_member_id: string | null;
  priority: Priority;
  repeat_rule: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  family_id: string;
  title: string;
  description: string;
  family_member_id: string | null;
  due_date: string | null;
  priority: Priority;
  star_value: number;
  completed: boolean;
}

export interface FamilySettings {
  id: string;
  family_id: string;
  mode: ThemeMode;
  accent_color: string;
  palette: ThemePalette;
  saved_palettes: SavedPalette[];
  default_view: CalendarView;
  home_view: CalendarView;
  calendar_view: CalendarView;
  first_day_of_week: 0 | 1;
  temperature_unit: 'c' | 'f';
  weather_location: string;
}

export interface DashboardData {
  family: Family;
  members: FamilyMember[];
  events: CalendarEvent[];
  reminders: Reminder[];
  todos: Todo[];
  settings: FamilySettings;
}

export type CreateEvent = Omit<CalendarEvent, 'id' | 'family_id'>;
export type CreateReminder = Omit<Reminder, 'id' | 'family_id' | 'completed'>;
export type CreateTodo = Omit<Todo, 'id' | 'family_id' | 'completed'>;
export type CreateMember = Pick<FamilyMember, 'name' | 'color' | 'emoji' | 'member_type'> & { avatar_url?: string | null };
