import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip, ZAxis, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import type { Tweet } from '../lib/types';

interface Props {
  tweets: Tweet[];
}

const NEON_COLORS = ['#00E5FF', '#FF007F', '#39FF14', '#F59E0B', '#EC4899', '#14B8A6'];

export default function ReplyNetworkMap({ tweets }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data, userIndex } = useMemo(() => {
    const userEngagement: Record<string, number> = {};
    tweets.forEach(t => {
      userEngagement[t.username] = (userEngagement[t.username] || 0) + t.engagement;
    });

    const users = Object.keys(userEngagement).sort();
    const idx: Record<string, number> = {};
    users.forEach((u, i) => { idx[u] = i; });

    const points: any[] = [];

    // Add all users as nodes
    users.forEach((u, i) => {
      points.push({
        x: i,
        y: -1,
        z: Math.max(30, Math.min(200, userEngagement[u] / 20)),
        username: u,
        replyTo: null,
        engagement: userEngagement[u],
        isUser: true,
      });
    });

    // Add reply connections
    tweets.forEach(t => {
      if (t.in_reply_to_screen_name && idx[t.in_reply_to_screen_name] !== undefined) {
        points.push({
          x: idx[t.username],
          y: idx[t.in_reply_to_screen_name],
          z: Math.max(20, Math.min(100, t.engagement / 10)),
          username: t.username,
          replyTo: t.in_reply_to_screen_name,
          engagement: t.engagement,
          isUser: false,
        });
      }
    });

    return { data: points, userIndex: idx };
  }, [tweets]);

  if (data.length <= 1) {
    return (
      <div className="bento-card h-full flex items-center justify-center">
        <p className={`text-sm ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>No reply network data</p>
      </div>
    );
  }

  const userNames = Object.keys(userIndex);

  return (
    <div className="bento-card h-full flex flex-col">
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
        Reply Network Map
      </h2>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <XAxis
              type="category"
              dataKey="x"
              name="User"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: isDark ? '#6B7280' : '#9CA3AF' }}
              ticks={userNames.map((_, i) => i)}
              tickFormatter={(v: number) => userNames[v]?.replace(/_/g, ' ').substring(0, 10) || ''}
            />
            <YAxis
              type="category"
              dataKey="y"
              name="Replied To"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: isDark ? '#6B7280' : '#9CA3AF' }}
              ticks={userNames.map((_, i) => i)}
              tickFormatter={(v: number) => userNames[v]?.replace(/_/g, ' ').substring(0, 10) || ''}
            />
            <ZAxis type="number" dataKey="z" range={[40, 200]} />
            <Tooltip
              contentStyle={{
                background: isDark ? '#151D30' : '#FFFFFF',
                border: `1px solid ${isDark ? '#22314E' : '#E5E7EB'}`,
                borderRadius: '12px',
                color: isDark ? '#F9FAFB' : '#111827',
                fontSize: 12,
              }}
              formatter={(_: any, __: any, props: any) => {
                const d = props.payload;
                if (d.replyTo) return [`${d.username} → ${d.replyTo}`, 'Reply'];
                return [d.username, 'User'];
              }}
            />
            <Scatter data={data} fill="#00E5FF">
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.replyTo ? '#FF007F' : NEON_COLORS[i % NEON_COLORS.length]}
                  fillOpacity={d.replyTo ? 0.7 : 0.9}
                  stroke={d.replyTo ? '#FF007F' : NEON_COLORS[i % NEON_COLORS.length]}
                  strokeWidth={1}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-1">
        <span className="flex items-center gap-1 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan" /> Users
        </span>
        <span className="flex items-center gap-1 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-neon-magenta" /> Replies
        </span>
      </div>
    </div>
  );
}
