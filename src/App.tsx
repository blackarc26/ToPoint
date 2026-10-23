import { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { FilterProvider } from './context/FilterContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ResearchFlow from './components/ResearchFlow';
import ChatHistory from './components/ChatHistory';
import Settings from './components/Settings';
import { fetchResearchSessions, saveResearchSession } from './lib/data';
import type { ResearchSession } from './lib/types';
import './index.css';

type View = 'dashboard' | 'research' | 'chats' | 'settings';

function Workspace() {
  const [view, setView] = useState<View>('dashboard');
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [activeSession, setActiveSession] = useState<ResearchSession | null>(null);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    fetchResearchSessions().then(loaded => {
      setSessions(loaded);
      setActiveSession(loaded[0] ?? null);
    }).catch(() => setSessionError('Research history is temporarily unavailable.'));
  }, []);

  const navigate = (nextView: View) => {
    setView(nextView);
    setSessionError('');
  };

  const completeResearch = async (draft: ResearchSession) => {
    const saved = await saveResearchSession(draft);
    setSessions(previous => [saved, ...previous.filter(session => session.id !== saved.id)]);
    setActiveSession(saved);
    setView('dashboard');
  };

  return <div className="min-h-screen"><Header view={view} onNavigate={navigate} /><div aria-live="polite">{sessionError && <div className="border-b border-[#F59E0B]/30 bg-[#F59E0B]/10 px-6 py-3 text-center text-sm text-[#F59E0B]">{sessionError}</div>}</div>{view === 'dashboard' && <Dashboard activeSession={activeSession} />}{view === 'research' && <ResearchFlow onBack={() => navigate('dashboard')} onComplete={completeResearch} />}{view === 'chats' && <ChatHistory sessions={sessions} onNewResearch={() => navigate('research')} onOpenDashboard={session => { setActiveSession(session); navigate('dashboard'); }} />}{view === 'settings' && <Settings />}</div>;
}

export default function App() {
  return <ThemeProvider><FilterProvider><Workspace /></FilterProvider></ThemeProvider>;
}
