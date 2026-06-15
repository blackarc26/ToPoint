import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import type { Tweet } from '../lib/types';
import { ExternalLink, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface Props {
  tweets: Tweet[];
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m ago`;
}

function highlightHashtags(text: string): React.ReactNode[] {
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('#')) {
      return <span key={i} className="text-neon-cyan font-medium">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function TweetFeed({ tweets }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedTweets = [...tweets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="bento-card h-full flex flex-col">
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
        Tweet Feed
      </h2>
      <div className="flex-1 overflow-auto space-y-3 pr-1">
        {sortedTweets.map(t => {
          const isExpanded = expandedId === t.id;
          return (
            <div
              key={t.id}
              className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
                isDark
                  ? 'bg-[#0B0F19] border border-[#22314E] hover:border-neon-cyan/30'
                  : 'bg-[#F9FAFB] border border-[#E5E7EB] hover:border-cyan-300'
              } ${isExpanded ? 'ring-1 ring-neon-cyan/20' : ''}`}
              onClick={() => setExpandedId(isExpanded ? null : t.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${isDark ? 'text-[#F9FAFB]' : 'text-[#111827]'}`}>
                      @{t.username}
                    </span>
                    {t.in_reply_to_screen_name && (
                      <span className="text-xs text-neon-magenta">
                        replying to @{t.in_reply_to_screen_name}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 text-xs ${isDark ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
                      <Clock className="w-3 h-3" />
                      {relativeTime(t.created_at)}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-2'} ${isDark ? 'text-[#D1D5DB]' : 'text-[#374151]'}`}>
                    {highlightHashtags(t.full_text)}
                  </p>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 fade-in">
                      {t.image_url && (
                        <div className="rounded-xl overflow-hidden">
                          <img
                            src={t.image_url}
                            alt="Tweet media"
                            className="w-full h-48 object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(t.extra_columns).map(([key, value]) => (
                          <span
                            key={key}
                            className={`text-xs px-2 py-0.5 rounded-lg ${
                              isDark ? 'bg-[#1E293B] text-[#9CA3AF] border border-[#22314E]' : 'bg-white text-[#6B7280] border border-[#E5E7EB]'
                            }`}
                          >
                            {key}: {value}
                          </span>
                        ))}
                      </div>

                      {t.location && (
                        <p className={`text-xs ${isDark ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
                          Location: {t.location}
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-xs text-neon-magenta font-medium">
                          {t.engagement.toLocaleString()} engagement
                        </span>
                        {t.tweet_url && (
                          <a
                            href={t.tweet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-neon-cyan hover:underline"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-center gap-1">
                  {!isExpanded ? (
                    <ChevronDown className={`w-4 h-4 ${isDark ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`} />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-neon-cyan" />
                  )}
                  {!isExpanded && (
                    <span className="text-xs text-neon-magenta font-medium">{t.engagement.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {sortedTweets.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className={`text-sm ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>No tweets match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
