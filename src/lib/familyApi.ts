import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { CreateEvent, CreateMember, CreateReminder, CreateTodo, DashboardData, Family, FamilyMember, FamilySettings } from '../types/family';

export async function loadDashboard(session: Session): Promise<DashboardData> {
  const profileResult = await supabase.from('profiles').select('active_family_id').eq('id', session.user.id).single();
  if (profileResult.error) throw profileResult.error;
  let familyId = profileResult.data.active_family_id as string | null;
  if (!familyId) {
    const membership = await supabase.from('family_accounts').select('family_id').eq('user_id', session.user.id).order('joined_at').limit(1).single();
    if (membership.error) throw membership.error;
    familyId = membership.data.family_id as string;
  }
  const familyResult = await supabase.from('families').select('*').eq('id', familyId).single();
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

async function clearStorageFolder(bucket: string, path: string): Promise<void> {
  const storage = supabase.storage.from(bucket);
  const { data, error } = await storage.list(path, { limit: 1000 });
  if (error) throw error;
  const files = data.filter((item) => item.id).map((item) => `${path}/${item.name}`);
  const folders = data.filter((item) => !item.id);
  if (files.length) {
    const result = await storage.remove(files);
    if (result.error) throw result.error;
  }
  await Promise.all(folders.map((folder) => clearStorageFolder(bucket, `${path}/${folder.name}`)));
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
  async uploadAvatar(familyId: string, file: File) {
    if (file.size > 5 * 1024 * 1024) throw new Error('Profile image must be smaller than 5 MB.');
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${familyId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('family-avatars').upload(path, file, { contentType: file.type });
    if (error) throw error;
    return path;
  },
  async uploadRoomPhoto(familyId: string, file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP room photo.');
    if (file.size > 8 * 1024 * 1024) throw new Error('Room photo must be smaller than 8 MB.');
    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${familyId}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
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
  async factoryReset(familyId: string) {
    const { error } = await supabase.rpc('factory_reset_family', { target_family: familyId });
    if (error) throw error;
    await Promise.allSettled([
      clearStorageFolder('family-avatars', familyId),
      clearStorageFolder('room-photos', familyId),
    ]);
  },
  async joinFamily(code: string) {
    const { error } = await supabase.rpc('join_family_by_code', { code: code.trim().toUpperCase() });
    if (error) throw error;
  },
  async rotateInviteCode(familyId: string) {
    const { data, error } = await supabase.rpc('rotate_family_join_code', { target_family: familyId });
    if (error) throw error;
    if (typeof data !== 'string') throw new Error('The new invite code was not returned.');
    return data;
  },
  subscribe(familyId: string, onChange: () => void) {
    const filter = `family_id=eq.${familyId}`;
    const channel = supabase.channel(`family-${familyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_members', filter }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders', filter }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_settings', filter }, onChange)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
};
