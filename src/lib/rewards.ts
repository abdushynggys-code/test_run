import type { FamilyMember, Todo } from '../types/family';
import { toDateKey } from './date';

export interface RewardRank {
  member: FamilyMember;
  stars: number;
  tasks: number;
  isWinner: boolean;
}

export interface RewardProgress {
  level: number;
  totalStars: number;
  levelStars: number;
  starsToNext: number;
  percent: number;
}

export function dailyLeaderboard(members: FamilyMember[], todos: Todo[], includeAdults: boolean, date = new Date()): RewardRank[] {
  const day = toDateKey(date);
  const players = members.filter((member) => member.active && (member.member_type === 'child' || includeAdults && member.member_type === 'adult'));
  const rows = players.map((member) => {
    const completed = todos.filter((todo) => todo.family_member_id === member.id && todo.completed && todo.completed_at && toDateKey(new Date(todo.completed_at)) === day);
    return { member, stars: completed.reduce((sum, todo) => sum + todo.star_value, 0), tasks: completed.length };
  }).sort((a, b) => b.stars - a.stars || b.tasks - a.tasks || a.member.name.localeCompare(b.member.name));
  const topScore = rows[0]?.stars ?? 0;
  return rows.map((row) => ({ ...row, isWinner: topScore > 0 && row.stars === topScore }));
}

export function rewardProgress(memberId: string, todos: Todo[]): RewardProgress {
  const totalStars = todos.filter((todo) => todo.completed && todo.family_member_id === memberId).reduce((sum, todo) => sum + todo.star_value, 0);
  const levelStars = totalStars % 20;
  return { level: Math.floor(totalStars / 20) + 1, totalStars, levelStars, starsToNext: 20 - levelStars, percent: levelStars * 5 };
}
