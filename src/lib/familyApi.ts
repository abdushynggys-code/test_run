import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { CreateEvent, CreateMember, CreateReminder, CreateTodo, DashboardData, Family, FamilySettings } from '../types/family';

export async function loadDashboard(session: Session): Promise<DashboardData> {
  const familyResult = await supabase.from('families').select('*').eq('owner_id', session.user.id).single();
  if (familyResult.error) throw familyResult.error;
  const family = familyResult.data as Family;
  const [members, events, reminders, todos, settings] = await Promise.all([
    supabase.from('family_members').select('*').eq('family_id', family.id).eq('active', true).order('created_at'),
    supabase.from('events').select('*').eq('family_id', family.id).order('start_time'),
    supabase.from('reminders').select('*').eq('family_id', family.id).order('reminder_time'),
    supabase.from('todos').select('*').eq('family_id', family.id).order('created_at'),
    supabase.from('family_settings').select('*').eq('family_id', family.id).single(),
  ]);
  const failure = [members, events, reminders, todos, settings].find((result) => result.error);
  if (failure?.error) throw failure.error;
  return { family, members: members.data, events: events.data, reminders: reminders.data, todos: todos.data, settings: settings.data } as DashboardData;
}

async function insertRow(table: string, value: Record<string, unknown>) {
  const { error } = await supabase.from(table).insert(value);
  if (error) throw error;
}

export const familyApi = {
  addEvent: (familyId: string, userId: string, value: CreateEvent) => insertRow('events', { ...value, family_id: familyId, created_by: userId }),
  addReminder: (familyId: string, userId: string, value: CreateReminder) => insertRow('reminders', { ...value, family_id: familyId, created_by: userId, completed: false }),
  addTodo: (familyId: string, userId: string, value: CreateTodo) => insertRow('todos', { ...value, family_id: familyId, created_by: userId, completed: false }),
  addMember: (familyId: string, value: CreateMember) => insertRow('family_members', { ...value, family_id: familyId, active: true }),
  async toggle(table: 'todos' | 'reminders', id: string, completed: boolean) {
    const { error } = await supabase.from(table).update({ completed }).eq('id', id);
    if (error) throw error;
  },
  async remove(table: 'events' | 'todos' | 'reminders', id: string) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },
  async deactivateMember(id: string) {
    const { error } = await supabase.from('family_members').update({ active: false }).eq('id', id);
    if (error) throw error;
  },
  async saveSettings(familyId: string, value: Partial<FamilySettings>) {
    const { error } = await supabase.from('family_settings').update(value).eq('family_id', familyId);
    if (error) throw error;
  },
};
