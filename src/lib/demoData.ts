import type { DashboardData } from '../types/family';
import { addDays, toDateKey } from './date';
import { DEFAULT_PALETTE } from './themePalettes';

const now = new Date();
const at = (day: number, time: string) => `${toDateKey(addDays(now, day))}T${time}:00`;

export const demoData: DashboardData = {
  family: { id: 'demo-family', name: 'The Parker Family', owner_id: 'demo-parent' },
  members: [
    { id: 'mom', family_id: 'demo-family', name: 'Mom', avatar_url: null, color: '#ef6f91', emoji: 'M', member_type: 'adult', active: true, level_20_pass_date: null },
    { id: 'dad', family_id: 'demo-family', name: 'Dad', avatar_url: null, color: '#4d8ef7', emoji: 'D', member_type: 'adult', active: true, level_20_pass_date: null },
    { id: 'emma', family_id: 'demo-family', name: 'Emma', avatar_url: null, color: '#51ae78', emoji: 'E', member_type: 'child', active: true, level_20_pass_date: null },
    { id: 'noah', family_id: 'demo-family', name: 'Noah', avatar_url: null, color: '#8b6dda', emoji: 'N', member_type: 'child', active: true, level_20_pass_date: null },
    { id: 'family', family_id: 'demo-family', name: 'Family', avatar_url: null, color: '#28a6a0', emoji: 'F', member_type: 'group', active: true, level_20_pass_date: null },
  ],
  events: [
    { id: 'e1', family_id: 'demo-family', title: 'School drop-off', description: '', start_time: at(0, '08:00'), end_time: at(0, '08:30'), all_day: false, location: 'Lincoln School', family_member_id: 'emma', color: null, repeat_rule: 'weekly' },
    { id: 'e2', family_id: 'demo-family', title: 'Dentist', description: '', start_time: at(0, '10:30'), end_time: at(0, '11:30'), all_day: false, location: 'Downtown', family_member_id: 'family', color: null, repeat_rule: 'none' },
    { id: 'e3', family_id: 'demo-family', title: 'Soccer practice', description: '', start_time: at(1, '16:00'), end_time: at(1, '17:30'), all_day: false, location: 'West Field', family_member_id: 'noah', color: null, repeat_rule: 'weekly' },
    { id: 'e4', family_id: 'demo-family', title: 'Family dinner', description: '', start_time: at(3, '18:00'), end_time: at(3, '19:30'), all_day: false, location: 'Home', family_member_id: 'family', color: null, repeat_rule: 'weekly' },
    { id: 'e5', family_id: 'demo-family', title: 'Ava’s birthday', description: '', start_time: at(6, '12:00'), end_time: at(6, '14:00'), all_day: true, location: '', family_member_id: 'mom', color: null, repeat_rule: 'yearly' },
  ],
  reminders: [
    { id: 'r1', family_id: 'demo-family', title: 'Dentist appointment', description: '', reminder_time: at(0, '10:00'), family_member_id: 'family', priority: 'high', repeat_rule: 'none', completed: false },
    { id: 'r2', family_id: 'demo-family', title: 'Trash night', description: '', reminder_time: at(1, '19:00'), family_member_id: 'dad', priority: 'medium', repeat_rule: 'weekly', completed: false },
  ],
  todos: [
    { id: 't1', family_id: 'demo-family', title: 'Tidy the reading corner', description: '', family_member_id: 'emma', due_date: toDateKey(now), priority: 'high', star_value: 3, completed: false, completed_at: null },
    { id: 't2', family_id: 'demo-family', title: 'Put away the games', description: '', family_member_id: 'noah', due_date: toDateKey(now), priority: 'medium', star_value: 2, completed: false, completed_at: null },
    { id: 't3', family_id: 'demo-family', title: 'Water the plants', description: '', family_member_id: 'emma', due_date: toDateKey(now), priority: 'low', star_value: 2, completed: true, completed_at: now.toISOString() },
    { id: 't4', family_id: 'demo-family', title: 'Make the beds', description: '', family_member_id: 'noah', due_date: toDateKey(now), priority: 'medium', star_value: 3, completed: true, completed_at: now.toISOString() },
  ],
  settings: { id: 'demo-settings', family_id: 'demo-family', mode: 'light', accent_color: DEFAULT_PALETTE.primary, palette: DEFAULT_PALETTE, saved_palettes: [], default_view: 'week', home_view: 'week', calendar_view: 'month', first_day_of_week: 1, temperature_unit: 'c', weather_location: 'Almaty', weather_latitude: null, weather_longitude: null, leaderboard_include_adults: false, tutorial_completed: true },
};
