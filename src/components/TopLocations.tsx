import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import type { Tweet } from '../lib/types';

interface Props {
  tweets: Tweet[];
}

export default function TopLocations({ tweets }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = useMemo(() => {
    const locCount: Record<string, number> = {};
    tweets.forEach(t => {
      if (t.location) {
        locCount[t.location] = (locCount[t.location] || 0) + 1;
      }
    });
    return Object.entries(locCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name: name.split(',')[0], value }));
  }, [tweets]);

  if (data.length === 0) {
    return (
      <div className="bento-card h-full flex items-center justify-center">
        <p className={`text-sm ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>No location data</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div className="bento-card h-full flex flex-col">
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
        Top Locations
      </h2>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? '#6B7280' : '#9CA3AF' }} />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: isDark ? '#F9FAFB' : '#111827' }}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? '#151D30' : '#FFFFFF',
                border: `1px solid ${isDark ? '#22314E' : '#E5E7EB'}`,
                borderRadius: '12px',
                color: isDark ? '#F9FAFB' : '#111827',
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
              {data.map((d, i) => {
                const ratio = d.value / maxVal;
                const r = Math.round(0 + ratio * 255);
                const g = Math.round(229 - ratio * 229);
                const b = Math.round(255 - ratio * 128);
                return <Cell key={i} fill={`rgb(${r},${g},${b})`} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
