import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Search, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { ResearchSession } from '../lib/types';

interface ResearchFlowProps {
  onBack: () => void;
  onComplete: (session: ResearchSession) => Promise<void>;
}

const examples = [
  'People thinking about quitting social media',
  'Remote work burnout',
  'Moving to a new city alone',
  'Skipped birthdays',
];

function buildQueries(topic: string, goal: string): string[] {
  const subject = topic.trim();
  const outcome = goal.trim();
  return [
    `I feel overwhelmed by ${subject.toLowerCase()}`,
    `I can't stand the pressure around ${subject.toLowerCase()}`,
    `I want to disconnect from ${subject.toLowerCase()}`,
    `I feel lonely even when dealing with ${subject.toLowerCase()}`,
    `I need a break from ${subject.toLowerCase()}`,
    `I feel exhausted thinking about ${subject.toLowerCase()}`,
    `I miss real connections while dealing with ${subject.toLowerCase()}`,
    `I feel judged when I talk about ${subject.toLowerCase()}`,
    `I can't keep up with ${subject.toLowerCase()}`,
    `What people wish others understood about ${subject.toLowerCase()}`,
    `Unmet needs behind ${subject.toLowerCase()}`,
    outcome ? `${outcome} related to ${subject.toLowerCase()}` : `How people really feel about ${subject.toLowerCase()}`,
  ];
}

export default function ResearchFlow({ onBack, onComplete }: ResearchFlowProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [step, setStep] = useState<'brief' | 'queries'>('brief');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [queries, setQueries] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canContinue = topic.trim().length > 2 && goal.trim().length > 2;
  const queryText = useMemo(() => queries.join('\n'), [queries]);

  const generateQueries = () => {
    if (!canContinue) return;
    setQueries(buildQueries(topic, goal));
    setStep('queries');
    setError('');
  };

  const regenerate = () => setQueries(buildQueries(topic, goal));

  const approve = async () => {
    const cleanedQueries = queryText.split('\n').map(query => query.trim()).filter(Boolean);
    if (cleanedQueries.length === 0) return;
    setSaving(true);
    setError('');
    try {
      await onComplete({
        id: crypto.randomUUID(),
        topic: topic.trim(),
        goal: goal.trim(),
        queries: cleanedQueries,
        created_at: new Date().toISOString(),
      });
    } catch {
      setError('This research could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 ${
    isDark ? 'border-[#2B3448] bg-[#0D1018] text-[#F9FAFB] placeholder-[#687184]' : 'border-[#D9DEE7] bg-white text-[#111827] placeholder-[#98A2B3]'
  }`;
  const muted = isDark ? 'text-[#8B93A5]' : 'text-[#687385]';

  return (
    <main className={`min-h-[calc(100vh-73px)] px-4 py-12 sm:px-6 ${isDark ? 'bg-[#090A0E]' : 'bg-[#F7F8FA]'}`}>
      <div className="mx-auto max-w-[920px]">
        <div className="mb-8 text-center">
          <span className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${isDark ? 'border-[#30333C] bg-[#15161B] text-[#C6CBD7]' : 'border-[#E1E5EB] bg-white text-[#5F6B7A]'}`}>
            <span className="h-2 w-2 rounded-full bg-[#35C48B]" /> Twitter / X emotional research
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {step === 'brief' ? <><span className="research-gradient">What do you want</span><br /> to research today?</> : 'Shape the research direction'}
          </h1>
          <p className={`mx-auto mt-5 max-w-[690px] text-base leading-7 sm:text-lg ${muted}`}>
            {step === 'brief' ? 'Describe a topic and your goal. We’ll turn it into focused search queries and surface the emotions behind what people say.' : 'Review and edit the phrases before opening your insight dashboard.'}
          </p>
        </div>

        <section className={`rounded-[28px] border p-6 shadow-2xl sm:p-10 ${isDark ? 'border-[#252831] bg-[#111217]' : 'border-[#E1E5EB] bg-white'}`}>
          {step === 'brief' ? (
            <div className="space-y-7">
              <label className="block">
                <span className="mb-3 block text-sm font-semibold">What do you want to research?</span>
                <input className={inputClass} value={topic} onChange={event => setTopic(event.target.value)} placeholder="e.g. Why people stop celebrating birthdays" />
              </label>
              <label className="block">
                <span className="mb-3 block text-sm font-semibold">What’s the goal of this research?</span>
                <textarea className={`${inputClass} min-h-[112px] resize-y`} value={goal} onChange={event => setGoal(event.target.value)} placeholder="e.g. Understand the emotions and unmet needs behind it" />
              </label>
              <div>
                <p className={`mb-3 text-xs font-medium uppercase tracking-[0.16em] ${muted}`}>Start from an example</p>
                <div className="flex flex-wrap gap-2">
                  {examples.map(example => <button key={example} type="button" onClick={() => setTopic(example)} className={`rounded-full border px-3 py-2 text-sm transition hover:-translate-y-0.5 ${isDark ? 'border-[#353844] bg-[#1A1B21] text-[#D8DCE5] hover:border-[#7077FF]' : 'border-[#DDE2EA] bg-[#F8F9FB] text-[#4B5565] hover:border-[#7077FF]'}`}>{example}</button>)}
                </div>
              </div>
              <button type="button" onClick={generateQueries} disabled={!canContinue} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6563F5] via-[#C645E8] to-[#22C5DD] px-5 py-4 font-semibold text-white shadow-[0_10px_28px_rgba(143,77,231,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"><Sparkles className="h-4 w-4" /> Generate search queries <ArrowRight className="h-4 w-4" /></button>
              <button type="button" onClick={onBack} className={`flex w-full items-center justify-center gap-2 text-sm ${muted}`}><ArrowLeft className="h-4 w-4" /> Return to dashboard</button>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div><p className={`text-sm ${muted}`}>Researching</p><h2 className="mt-1 text-xl font-semibold">{topic}</h2></div>
                <Search className="mt-1 h-5 w-5 shrink-0 text-[#C645E8]" />
              </div>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Review and edit the search queries</span><span className={`mb-3 block text-sm ${muted}`}>One phrase per line. These are the exact phrases used to organize your X research.</span><textarea className={`${inputClass} min-h-[300px] resize-y font-mono leading-7`} value={queryText} onChange={event => setQueries(event.target.value.split('\n'))} /></label>
              {error && <p className="mt-4 text-sm text-[#F87171]">{error}</p>}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setStep('brief')} className={`rounded-2xl border px-5 py-3 text-sm font-medium transition hover:border-[#6B7280] ${isDark ? 'border-[#353844] text-[#D8DCE5]' : 'border-[#DDE2EA] text-[#4B5565]'}`}><ArrowLeft className="mr-2 inline h-4 w-4" /> Back</button>
                <button type="button" onClick={regenerate} className={`rounded-2xl border px-5 py-3 text-sm font-medium transition hover:border-[#6B7280] ${isDark ? 'border-[#353844] text-[#D8DCE5]' : 'border-[#DDE2EA] text-[#4B5565]'}`}><RotateCcw className="mr-2 inline h-4 w-4" /> Regenerate</button>
                <button type="button" onClick={approve} disabled={saving} className="flex-1 rounded-2xl bg-gradient-to-r from-[#6563F5] via-[#C645E8] to-[#22C5DD] px-5 py-3 font-semibold text-white shadow-[0_10px_28px_rgba(143,77,231,0.3)] transition hover:-translate-y-0.5 disabled:opacity-50">{saving ? 'Saving research…' : <><Check className="mr-2 inline h-4 w-4" /> Approve & start research <ArrowRight className="ml-1 inline h-4 w-4" /></>}</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
