import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import type { Tweet } from '../lib/types';

interface Props {
  tweets: Tweet[];
}

export default function TweetVolumeChart({ tweets }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = useMemo(() => {
    const byDate: Record<string, number> = {};
    tweets.forEach(t => {
      const date = new Date(t.created_at).toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
        isSpike: false,
      }));
  }, [tweets]);

  const avg = data.length > 0 ? data.reduce((s, d) => s + d.count, 0) / data.length : 0;
  const annotatedData = data.map(d => ({
    ...d,
    isSpike: d.count > avg * 1.5,
  }));

  return (
    <div className="bento-card h-full flex flex-col">
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
        Tweet Volume Over Time
      </h2>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={annotatedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: isDark ? '#6B7280' : '#9CA3AF' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: isDark ? '#6B7280' : '#9CA3AF' }}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? '#151D30' : '#FFFFFF',
                border: `1px solid ${isDark ? '#22314E' : '#E5E7EB'}`,
                borderRadius: '12px',
                color: isDark ? '#F9FAFB' : '#111827',
                fontSize: 12,
              }}
              labelStyle={{ color: isDark ? '#6B7280' : '#9CA3AF' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#00E5FF"
              strokeWidth={2.5}
              fill="url(#cyanGradient)"
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.isSpike) {
                  return (
                    <g key={`spike-${cx}-${cy}`}>
                      <circle cx={cx} cy={cy} r={8} fill="#FF007F" opacity={0.25} className="pulse-dot" />
                      <circle cx={cx} cy={cy} r={4} fill="#FF007F" stroke="#FF007F" strokeWidth={1} />
                    </g>
                  );
                }
                return <Dot key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={2.5} fill="#00E5FF" stroke="none" />;
              }}
              activeDot={{ r: 5, fill: '#00E5FF', stroke: isDark ? '#151D30' : '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
