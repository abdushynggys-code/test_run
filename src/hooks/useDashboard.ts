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

  async function run(remote: () => Promise<void>, local: (current: DashboardData) => DashboardData) {
    if (isDemo) { setData((current) => current ? local(current) : current); return; }
    try { await remote(); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save changes.'); }
  }

  const id = () => crypto.randomUUID();
  return {
    data, error, refresh,
    addEvent: (value: CreateEvent) => data && run(() => familyApi.addEvent(data.family.id, session?.user.id ?? '', value), (current) => ({ ...current, events: [...current.events, { ...value, id: id(), family_id: current.family.id }] })),
    addReminder: (value: CreateReminder) => data && run(() => familyApi.addReminder(data.family.id, session?.user.id ?? '', value), (current) => ({ ...current, reminders: [...current.reminders, { ...value, id: id(), family_id: current.family.id, completed: false }] })),
    addTodo: (value: CreateTodo) => data && run(() => familyApi.addTodo(data.family.id, session?.user.id ?? '', value), (current) => ({ ...current, todos: [...current.todos, { ...value, id: id(), family_id: current.family.id, completed: false }] })),
    addMember: (value: CreateMember) => data && run(() => familyApi.addMember(data.family.id, value), (current) => ({ ...current, members: [...current.members, { ...value, id: id(), family_id: current.family.id, active: true }] })),
    toggleItem: (table: 'todos' | 'reminders', itemId: string, completed: boolean) => run(() => familyApi.toggle(table, itemId, completed), (current) => ({ ...current, [table]: current[table].map((item) => item.id === itemId ? { ...item, completed } : item) })),
    removeItem: (table: 'events' | 'todos' | 'reminders', itemId: string) => run(() => familyApi.remove(table, itemId), (current) => ({ ...current, [table]: current[table].filter((item) => item.id !== itemId) })),
    saveSettings: (value: Partial<FamilySettings>) => data && run(() => familyApi.saveSettings(data.family.id, value), (current) => ({ ...current, settings: { ...current.settings, ...value } })),
  };
}
