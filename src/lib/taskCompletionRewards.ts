import type { FamilyMember, Todo } from '../types/family';
import { dailyLeaderboard, rewardProgress } from './rewards';

interface CompletionRewards {
  newlyCrowned: ReturnType<typeof dailyLeaderboard>;
  passMember: FamilyMember | null;
}

export function taskCompletionRewards(
  todo: Todo,
  todos: Todo[],
  members: FamilyMember[],
  includeAdults: boolean,
  currentWinnerIds: Set<string>,
): CompletionRewards {
  const member = members.find((item) => item.id === todo.family_member_id);
  const canCompete = member && (member.member_type === 'child' || includeAdults && member.member_type === 'adult');
  if (!member || !canCompete) return { newlyCrowned: [], passMember: null };

  const projected = todos.map((item) => item.id === todo.id
    ? { ...item, completed: true, completed_at: new Date().toISOString() }
    : item);
  const newlyCrowned = dailyLeaderboard(members, projected, includeAdults)
    .filter((rank) => rank.isWinner && !currentWinnerIds.has(rank.member.id));
  const earnsPass = member.member_type === 'child'
    && !member.level_20_pass_date
    && rewardProgress(member.id, projected).level >= 20;
  return { newlyCrowned, passMember: earnsPass ? member : null };
}
