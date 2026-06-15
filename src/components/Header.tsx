import { useTheme } from '../context/ThemeContext';
import { useFilters } from '../context/FilterContext';
import { Search, Calendar, ListFilter as Filter, Sun, Moon } from 'lucide-react';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery, keywordFilter, setKeywordFilter, dateFrom, setDateFrom, dateTo, setDateTo } = useFilters();
  const isDark = theme === 'dark';

  const inputBase = `px-3 py-2 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 ${
    isDark
      ? 'bg-[#0B0F19] border border-[#22314E] text-[#F9FAFB] placeholder-[#6B7280]'
      : 'bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] placeholder-[#9CA3AF]'
  }`;

  return (
    <header className={`w-full px-6 py-4 transition-all duration-300 ${
      isDark ? 'bg-[#151D30] border-b border-[#22314E]' : 'bg-white border-b border-[#E5E7EB]'
    }`}>
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#111827]'}`}>
            Twitter Insights
          </h1>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`} />
            <input
              type="text"
              placeholder="Search tweets, users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`${inputBase} pl-10 w-full`}
            />
          </div>

          <div className="relative min-w-[160px]">
            <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`} />
            <input
              type="text"
              placeholder="Keyword filter"
              value={keywordFilter}
              onChange={e => setKeywordFilter(e.target.value)}
              className={`${inputBase} pl-10 w-full`}
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`} />
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className={inputBase}
            />
            <span className={`text-xs ${isDark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className={inputBase}
            />
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className={`relative w-14 h-8 rounded-full transition-all duration-300 shrink-0 ${
            isDark
              ? 'bg-gradient-to-r from-neon-cyan/30 to-neon-magenta/30 border border-[#22314E]'
              : 'bg-gradient-to-r from-cyan-200 to-magenta-200 border border-[#E5E7EB]'
          }`}
          aria-label="Toggle theme"
        >
          <div className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
            isDark
              ? 'left-7 bg-[#151D30] shadow-[0_0_8px_rgba(0,229,255,0.5)]'
              : 'left-1 bg-white shadow-md'
          }`}>
            {isDark ? <Moon className="w-3 h-3 text-neon-cyan" /> : <Sun className="w-3 h-3 text-amber-500" />}
          </div>
        </button>
      </div>
    </header>
  );
}
