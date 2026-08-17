import type { FamilyMember, Todo } from '../../types/family';
import { dailyLeaderboard } from '../../lib/rewards';

interface Props {
  members: FamilyMember[];
  todos: Todo[];
  includeAdults: boolean;
  onProfiles: () => void;
}

export function DailyLeaderboard({ members, todos, includeAdults, onProfiles }: Props) {
  const ranks = dailyLeaderboard(members, todos, includeAdults);
  return <section className="home-panel reward-leaderboard">
    <header><div><p className="eyebrow">TODAY'S STARS</p><h2>Family leaderboard</h2></div><button onClick={onProfiles}>Profiles</button></header>
    {ranks.length ? <div className="reward-ranks">{ranks.map((rank, index) => <article className={rank.isWinner ? 'winner' : ''} key={rank.member.id}>
      <b className="rank-number">{rank.isWinner ? '♛' : index + 1}</b>
      <span className="reward-avatar" style={{ background: rank.member.color }}>{rank.member.avatar_url ? <img src={rank.member.avatar_url} alt="" /> : rank.member.emoji}{rank.isWinner && <i>👑</i>}</span>
      <span><strong>{rank.member.name}</strong><small>{rank.tasks ? `${rank.tasks} task${rank.tasks === 1 ? '' : 's'} finished` : 'Ready to earn stars'}</small></span>
      <b className="star-score">★ {rank.stars}</b>
    </article>)}</div> : <p className="home-empty">Add a child profile to start the family challenge.</p>}
    <footer>Parents are {includeAdults ? 'included' : 'not ranked'} · Change this in Settings</footer>
  </section>;
}
