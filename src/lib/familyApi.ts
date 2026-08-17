import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { CreateEvent, CreateMember, CreateReminder, CreateTodo, DashboardData, Family, FamilyMember, FamilySettings } from '../types/family';

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
  const memberRows = members.data as FamilyMember[];
  const membersWithImages = await Promise.all(memberRows.map(async (member) => {
    if (!member.avatar_url || member.avatar_url.startsWith('http')) return member;
    const { data } = await supabase.storage.from('family-avatars').createSignedUrl(member.avatar_url, 3_600);
    return { ...member, avatar_url: data?.signedUrl ?? null };
  }));
  return { family, members: membersWithImages, events: events.data, reminders: reminders.data, todos: todos.data, settings: settings.data } as DashboardData;
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
    const value = table === 'todos' ? { completed, completed_at: completed ? new Date().toISOString() : null } : { completed };
    const { error } = await supabase.from(table).update(value).eq('id', id);
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
  async uploadAvatar(userId: string, file: File) {
    if (file.size > 5 * 1024 * 1024) throw new Error('Profile image must be smaller than 5 MB.');
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('family-avatars').upload(path, file, { contentType: file.type });
    if (error) throw error;
    return path;
  },
  async uploadRoomPhoto(userId: string, file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP room photo.');
    if (file.size > 8 * 1024 * 1024) throw new Error('Room photo must be smaller than 8 MB.');
    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${userId}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('room-photos').upload(path, file, { contentType: file.type });
    if (error) throw error;
    return path;
  },
  async updateMemberAvatar(memberId: string, avatarPath: string) {
    const { error } = await supabase.from('family_members').update({ avatar_url: avatarPath }).eq('id', memberId);
    if (error) throw error;
  },
  async updateMemberColor(memberId: string, color: string) {
    const { error } = await supabase.from('family_members').update({ color }).eq('id', memberId);
    if (error) throw error;
  },
  async updateMemberName(memberId: string, name: string) {
    const { error } = await supabase.from('family_members').update({ name, emoji: name.slice(0, 1).toUpperCase() }).eq('id', memberId);
    if (error) throw error;
  },
  async grantLevel20Pass(memberId: string, date: string) {
    const { error } = await supabase.from('family_members').update({ level_20_pass_date: date }).eq('id', memberId).is('level_20_pass_date', null);
    if (error) throw error;
  },
  async saveSettings(familyId: string, value: Partial<FamilySettings>) {
    const { error } = await supabase.from('family_settings').update(value).eq('family_id', familyId);
    if (error) throw error;
  },
};
