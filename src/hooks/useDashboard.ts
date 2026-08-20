import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { demoData } from '../lib/demoData';
import { familyApi, loadDashboard } from '../lib/familyApi';
import type { CreateEvent, CreateMember, CreateReminder, CreateTodo, DashboardData, FamilySettings } from '../types/family';

export function useDashboard(session: Session | null, isDemo: boolean) {
  const [data, setData] = useState<DashboardData | null>(isDemo ? demoData : null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!session || isDemo) return;
    try { setData(await loadDashboard(session)); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not load the family dashboard.'); }
  }, [isDemo, session]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (isDemo || !data?.family.id) return;
    let timer = 0;
    const unsubscribe = familyApi.subscribe(data.family.id, () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void refresh(), 120);
    });
    return () => { window.clearTimeout(timer); unsubscribe(); };
  }, [data?.family.id, isDemo, refresh]);

  async function run(remote: () => Promise<void>, local: (current: DashboardData) => DashboardData) {
    if (isDemo) { setData((current) => current ? local(current) : current); return; }
    try { await remote(); await refresh(); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save changes.'); }
  }

  const id = () => crypto.randomUUID();
  const factoryReset = async () => {
    if (!data) return;
    if (isDemo) { setData(demoData); return; }
    try { await familyApi.factoryReset(data.family.id); await refresh(); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not reset Kinboard.'); throw reason; }
  };
  return {
    data, error, refresh,
    addEvent: (value: CreateEvent) => data && run(() => familyApi.addEvent(data.family.id, session?.user.id ?? '', value), (current) => ({ ...current, events: [...current.events, { ...value, id: id(), family_id: current.family.id }] })),
    addReminder: (value: CreateReminder) => data && run(() => familyApi.addReminder(data.family.id, session?.user.id ?? '', value), (current) => ({ ...current, reminders: [...current.reminders, { ...value, id: id(), family_id: current.family.id, completed: false }] })),
    addTodo: (value: CreateTodo) => data && run(() => familyApi.addTodo(data.family.id, session?.user.id ?? '', value), (current) => ({ ...current, todos: [...current.todos, { ...value, id: id(), family_id: current.family.id, completed: false, completed_at: null }] })),
    addMember: (value: CreateMember, file?: File) => data && run(async () => {
      const avatarUrl = file ? await familyApi.uploadAvatar(data.family.id, file) : null;
      await familyApi.addMember(data.family.id, { ...value, avatar_url: avatarUrl });
    }, (current) => ({ ...current, members: [...current.members, { ...value, user_id: null, avatar_url: file ? URL.createObjectURL(file) : null, id: id(), family_id: current.family.id, active: true, level_20_pass_date: null }] })),
    updateMemberAvatar: (memberId: string, file: File) => run(async () => {
      if (!data) return;
      const avatarPath = await familyApi.uploadAvatar(data.family.id, file);
      await familyApi.updateMemberAvatar(memberId, avatarPath);
    }, (current) => ({ ...current, members: current.members.map((member) => member.id === memberId ? { ...member, avatar_url: URL.createObjectURL(file) } : member) })),
    updateMemberColor: (memberId: string, color: string) => run(() => familyApi.updateMemberColor(memberId, color), (current) => ({ ...current, members: current.members.map((member) => member.id === memberId ? { ...member, color } : member) })),
    updateMemberName: (memberId: string, name: string) => run(() => familyApi.updateMemberName(memberId, name), (current) => ({ ...current, members: current.members.map((member) => member.id === memberId ? { ...member, name, emoji: name.slice(0, 1).toUpperCase() } : member) })),
    grantLevel20Pass: (memberId: string, date: string) => run(() => familyApi.grantLevel20Pass(memberId, date), (current) => ({ ...current, members: current.members.map((member) => member.id === memberId ? { ...member, level_20_pass_date: date } : member) })),
    removeMember: (memberId: string) => run(() => familyApi.deactivateMember(memberId), (current) => ({ ...current, members: current.members.filter((member) => member.id !== memberId) })),
    toggleItem: (table: 'todos' | 'reminders', itemId: string, completed: boolean) => run(() => familyApi.toggle(table, itemId, completed), (current) => ({ ...current, [table]: current[table].map((item) => item.id === itemId ? { ...item, completed, ...(table === 'todos' ? { completed_at: completed ? new Date().toISOString() : null } : {}) } : item) })),
    removeItem: (table: 'events' | 'todos' | 'reminders', itemId: string) => run(() => familyApi.remove(table, itemId), (current) => ({ ...current, [table]: current[table].filter((item) => item.id !== itemId) })),
    saveSettings: (value: Partial<FamilySettings>) => data && run(() => familyApi.saveSettings(data.family.id, value), (current) => ({ ...current, settings: { ...current.settings, ...value } })),
    factoryReset,
    joinFamily: async (code: string) => {
      if (isDemo) throw new Error('Create an account to share a live family.');
      try { await familyApi.joinFamily(code); await refresh(); setError(''); }
      catch (reason) { const message = reason instanceof Error ? reason.message : 'Could not join that family.'; setError(message); throw new Error(message); }
    },
    rotateInviteCode: async () => {
      if (!data || isDemo) return;
      try {
        const joinCode = await familyApi.rotateInviteCode(data.family.id);
        setData((current) => current ? { ...current, family: { ...current.family, join_code: joinCode } } : current);
        setError('');
      } catch (reason) { const message = reason instanceof Error ? reason.message : 'Could not create a new invite code.'; setError(message); throw new Error(message); }
    },
    uploadRoomPhoto: async (file: File) => {
      if (isDemo) return;
      if (!session) throw new Error('Sign in to upload a room photo.');
      if (!data) throw new Error('The family is still loading.');
      await familyApi.uploadRoomPhoto(data.family.id, file);
    },
  };
}
