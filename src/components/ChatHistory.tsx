import { MessageSquare, Plus, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { ResearchSession } from '../lib/types';

interface ChatHistoryProps {
  sessions: ResearchSession[];
  onNewResearch: () => void;
  onOpenDashboard: (session: ResearchSession) => void;
}

export default function ChatHistory({ sessions, onNewResearch, onOpenDashboard }: ChatHistoryProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const muted = isDark ? 'text-[#8B93A5]' : 'text-[#687385]';
  return (
    <main className={`min-h-[calc(100vh-73px)] px-4 py-10 sm:px-6 ${isDark ? 'bg-[#090A0E]' : 'bg-[#F7F8FA]'}`}>
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className={`text-sm ${muted}`}>Workspace archive</p><h1 className="mt-1 text-3xl font-bold">Research chats</h1><p className={`mt-2 ${muted}`}>Return to a previous brief and continue exploring its dashboard.</p></div><button type="button" onClick={onNewResearch} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6563F5] to-[#22C5DD] px-4 py-3 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> New research</button></div>
        {sessions.length === 0 ? <div className={`rounded-3xl border p-12 text-center ${isDark ? 'border-[#252831] bg-[#111217]' : 'border-[#E1E5EB] bg-white'}`}><MessageSquare className="mx-auto h-8 w-8 text-[#7278FF]" /><h2 className="mt-4 text-lg font-semibold">No research chats yet</h2><p className={`mx-auto mt-2 max-w-md text-sm ${muted}`}>Your approved research briefs will appear here so you can quickly return to them.</p><button type="button" onClick={onNewResearch} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#6563F5] px-4 py-2.5 text-sm font-medium text-[#8A88FF]"><Search className="h-4 w-4" /> Start your first brief</button></div> : <div className="grid gap-4 md:grid-cols-2">{sessions.map(session => <button type="button" key={session.id} onClick={() => onOpenDashboard(session)} className={`group rounded-3xl border p-5 text-left transition hover:-translate-y-1 hover:border-[#7777FF] ${isDark ? 'border-[#252831] bg-[#111217]' : 'border-[#E1E5EB] bg-white'}`}><div className="flex items-start justify-between gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7068F5]/15 text-[#8A88FF]"><MessageSquare className="h-5 w-5" /></div><span className={`text-xs ${muted}`}>{new Date(session.created_at).toLocaleDateString()}</span></div><h2 className="mt-5 text-lg font-semibold group-hover:text-[#8A88FF]">{session.topic}</h2><p className={`mt-2 line-clamp-2 text-sm ${muted}`}>{session.goal}</p><div className={`mt-5 border-t pt-4 text-xs ${isDark ? 'border-[#252831] text-[#8B93A5]' : 'border-[#E8EBF0] text-[#687385]'}`}>{session.queries.length} search queries</div></button>)}</div>}
      </div>
    </main>
  );
}
