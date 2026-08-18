import type { FamilyMember, Todo } from '../types/family';
import { dailyLeaderboard, rewardProgress } from './rewards';

interface CompletionRewards {
  newlyCrowned: ReturnType<typeof dailyLeaderboard>;
  leveledUp: boolean;
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
  if (!member || !canCompete) return { newlyCrowned: [], leveledUp: false, passMember: null };

  const previousProgress = rewardProgress(member.id, todos);
  const projected = todos.map((item) => item.id === todo.id
    ? { ...item, completed: true, completed_at: new Date().toISOString() }
    : item);
  const nextProgress = rewardProgress(member.id, projected);
  const newlyCrowned = dailyLeaderboard(members, projected, includeAdults)
    .filter((rank) => rank.member.id === member.id && rank.isWinner && !currentWinnerIds.has(member.id));
  const earnsPass = member.member_type === 'child'
    && !member.level_20_pass_date
    && nextProgress.level >= 20;
  const leveledUp = member.member_type === 'child' && nextProgress.level > previousProgress.level;
  return { newlyCrowned, leveledUp, passMember: earnsPass ? member : null };
}
