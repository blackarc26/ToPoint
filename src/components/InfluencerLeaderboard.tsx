import { useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import type { Tweet } from '../lib/types';
import { Trophy, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  tweets: Tweet[];
}

type SortKey = 'tweets' | 'engagement' | 'replies';

export default function InfluencerLeaderboard({ tweets }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sortBy, setSortBy] = useState<SortKey>('engagement');
  const [sortAsc, setSortAsc] = useState(false);

  const data = useMemo(() => {
    const byUser: Record<string, { tweets: number; engagement: number; replies: number }> = {};
    tweets.forEach(t => {
      if (!byUser[t.username]) byUser[t.username] = { tweets: 0, engagement: 0, replies: 0 };
      byUser[t.username].tweets += 1;
      byUser[t.username].engagement += t.engagement;
      if (t.in_reply_to_screen_name) byUser[t.username].replies += 1;
    });

    return Object.entries(byUser)
      .map(([username, stats]) => ({ username, ...stats }))
      .sort((a, b) => {
        const dir = sortAsc ? 1 : -1;
        return (a[sortBy] - b[sortBy]) * dir;
      });
  }, [tweets, sortBy, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else { setSortBy(key); setSortAsc(false); }
  };

  const SortIcon = ({ active }: { active: boolean }) =>
    active ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null;

  const thBase = `px-3 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none flex items-center gap-1 transition-colors ${
    isDark ? 'text-[#6B7280] hover:text-neon-cyan' : 'text-[#9CA3AF] hover:text-cyan-600'
  }`;

  const medals = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div className="bento-card h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <Trophy className="w-4 h-4 text-neon-magenta" />
        <h2 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
          Influencer Leaderboard
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-[#22314E]' : 'border-[#E5E7EB]'}`}>
              <th className={`${thBase} w-8`}>#</th>
              <th className={`${thBase} text-left`}>User</th>
              <th className={`${thBase} justify-end`} onClick={() => toggleSort('tweets')}>
                Tweets <SortIcon active={sortBy === 'tweets'} />
              </th>
              <th className={`${thBase} justify-end`} onClick={() => toggleSort('engagement')}>
                Engage <SortIcon active={sortBy === 'engagement'} />
              </th>
              <th className={`${thBase} justify-end`} onClick={() => toggleSort('replies')}>
                Replies <SortIcon active={sortBy === 'replies'} />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((u, i) => (
              <tr
                key={u.username}
                className={`border-b transition-colors duration-150 ${
                  isDark ? 'border-[#22314E]/50 hover:bg-[#1E293B]' : 'border-[#E5E7EB]/50 hover:bg-[#F3F4F6]'
                }`}
              >
                <td className="px-3 py-2.5 text-center">
                  {i < 3 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold" style={{ background: `${medals[i]}20`, color: medals[i] }}>
                      {i + 1}
                    </span>
                  ) : (
                    <span className={`text-xs ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>{i + 1}</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span className={`text-sm font-medium ${isDark ? 'text-[#F9FAFB]' : 'text-[#111827]'}`}>
                    @{u.username}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-sm text-neon-cyan font-medium">{u.tweets}</td>
                <td className="px-3 py-2.5 text-right text-sm text-neon-magenta font-medium">{u.engagement.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right text-sm text-neon-lime font-medium">{u.replies}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
