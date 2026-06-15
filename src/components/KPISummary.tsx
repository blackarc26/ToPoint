import { useTheme } from '../context/ThemeContext';
import type { Tweet } from '../lib/types';
import { Users, ChartBar as BarChart3, Hash, Image } from 'lucide-react';

interface Props {
  tweets: Tweet[];
}

export default function KPISummary({ tweets }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const totalTweets = tweets.length;
  const uniqueUsers = new Set(tweets.map(t => t.username)).size;
  const uniqueVoiceRatio = totalTweets > 0 ? (uniqueUsers / totalTweets * 100) : 0;
  const totalEngagement = tweets.reduce((sum, t) => sum + t.engagement, 0);
  const withImage = tweets.filter(t => t.image_url).length;
  const mediaRichness = totalTweets > 0 ? (withImage / totalTweets * 100) : 0;

  const kpis = [
    { icon: Hash, label: 'Total Tweets', value: totalTweets.toLocaleString(), color: 'text-neon-cyan' },
    { icon: Users, label: 'Unique Voice Ratio', value: `${uniqueVoiceRatio.toFixed(1)}%`, color: 'text-neon-magenta' },
    { icon: BarChart3, label: 'Aggregate Engagement', value: totalEngagement.toLocaleString(), color: 'text-neon-cyan' },
  ];

  return (
    <div className="bento-card flex flex-col gap-5 h-full">
      <h2 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
        Core KPIs
      </h2>

      <div className="flex flex-col gap-4 flex-1">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`rounded-2xl p-4 transition-all duration-200 ${
            isDark ? 'bg-[#0B0F19] border border-[#22314E]' : 'bg-[#F9FAFB] border border-[#E5E7EB]'
          }`}>
            <div className="flex items-center gap-3">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <span className={`text-xs font-medium ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
                {kpi.label}
              </span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${kpi.color} ${kpi.color === 'text-neon-cyan' ? 'glow-cyan' : 'glow-magenta'}`}>
              {kpi.value}
            </p>
          </div>
        ))}

        <div className={`rounded-2xl p-4 transition-all duration-200 ${
          isDark ? 'bg-[#0B0F19] border border-[#22314E]' : 'bg-[#F9FAFB] border border-[#E5E7EB]'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Image className="w-5 h-5 text-neon-lime" />
            <span className={`text-xs font-medium ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
              Media Richness
            </span>
            <span className="text-sm font-bold text-neon-lime glow-lime ml-auto">
              {mediaRichness.toFixed(1)}%
            </span>
          </div>
          <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-[#1E293B]' : 'bg-[#E5E7EB]'}`}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${mediaRichness}%`,
                background: 'linear-gradient(90deg, #39FF14, #00E5FF)',
                boxShadow: '0 0 12px rgba(57,255,20,0.4)',
              }}
            />
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
            {withImage} of {totalTweets} tweets contain media
          </p>
        </div>
      </div>
    </div>
  );
}
