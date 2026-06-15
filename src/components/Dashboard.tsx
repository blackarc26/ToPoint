import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useFilters } from '../context/FilterContext';
import type { Tweet } from '../lib/types';
import { fetchTweets, filterTweets } from '../lib/data';
import KPISummary from './KPISummary';
import TweetVolumeChart from './TweetVolumeChart';
import KeywordBreakdown from './KeywordBreakdown';
import TopLocations from './TopLocations';
import ReplyNetworkMap from './ReplyNetworkMap';
import InfluencerLeaderboard from './InfluencerLeaderboard';
import TweetFeed from './TweetFeed';
import { Loader as Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { searchQuery, keywordFilter, dateFrom, dateTo } = useFilters();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTweets().then(data => {
      setTweets(data);
      setLoading(false);
    });
  }, []);

  const filteredTweets = useMemo(
    () => filterTweets(tweets, searchQuery, keywordFilter, dateFrom, dateTo),
    [tweets, searchQuery, keywordFilter, dateFrom, dateTo]
  );

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-[#0B0F19]' : 'bg-[#F9FAFB]'}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
          <p className={`text-sm ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0B0F19]' : 'bg-[#F9FAFB]'}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-5 auto-rows-auto">

          {/* Tile 1: Left Tall Column - KPIs (25% width, spans 2 rows) */}
          <div className="lg:row-span-2">
            <KPISummary tweets={filteredTweets} />
          </div>

          {/* Tile 2: Right Top Wide Canvas - Volume Chart (75% width) */}
          <div className="lg:col-span-3">
            <TweetVolumeChart tweets={filteredTweets} />
          </div>

          {/* Tiles 3-4-5: Middle Row - 3 equal squares */}
          <div>
            <KeywordBreakdown tweets={filteredTweets} />
          </div>
          <div>
            <TopLocations tweets={filteredTweets} />
          </div>
          <div>
            <ReplyNetworkMap tweets={filteredTweets} />
          </div>

          {/* Tile 6: Bottom Full Width Mega Tile */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">
              {/* Left panel: 40% = 2/5 */}
              <div className="lg:col-span-2">
                <InfluencerLeaderboard tweets={filteredTweets} />
              </div>
              {/* Right panel: 60% = 3/5 */}
              <div className="lg:col-span-3">
                <TweetFeed tweets={filteredTweets} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center mt-8 pb-4 text-xs ${isDark ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
          Twitter Insights Dashboard — {filteredTweets.length} tweets loaded
        </div>
      </div>
    </div>
  );
}
