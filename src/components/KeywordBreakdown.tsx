import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import type { Tweet } from '../lib/types';

interface Props {
  tweets: Tweet[];
}

const COLORS = ['#00E5FF', '#FF007F', '#39FF14', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function KeywordBreakdown({ tweets }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = useMemo(() => {
    const topicCount: Record<string, number> = {};
    tweets.forEach(t => {
      Object.entries(t.extra_columns).forEach(([key, value]) => {
        if (key === 'topic') {
          topicCount[value] = (topicCount[value] || 0) + 1;
        }
      });
    });
    return Object.entries(topicCount)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  }, [tweets]);

  if (data.length === 0) {
    return (
      <div className="bento-card h-full flex items-center justify-center">
        <p className={`text-sm ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>No keyword data</p>
      </div>
    );
  }

  return (
    <div className="bento-card h-full flex flex-col">
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
        Keyword Breakdown
      </h2>
      <div className="flex-1 min-h-[200px] flex items-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: isDark ? '#151D30' : '#FFFFFF',
                border: `1px solid ${isDark ? '#22314E' : '#E5E7EB'}`,
                borderRadius: '12px',
                color: isDark ? '#F9FAFB' : '#111827',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {data.map((d, i) => (
          <span
            key={d.name}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
            style={{
              background: `${COLORS[i % COLORS.length]}15`,
              color: COLORS[i % COLORS.length],
              border: `1px solid ${COLORS[i % COLORS.length]}30`,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}
