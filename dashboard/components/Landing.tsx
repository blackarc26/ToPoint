"use client";

import { useState } from "react";

const SAMPLE_PROMPTS = [
  {
    label: "🎂 Skipped birthdays",
    topic: "Why people stop celebrating birthdays",
    goal: "Understand the emotions and root causes behind people no longer celebrating their birthdays",
  },
  {
    label: "💻 Remote work burnout",
    topic: "How remote workers experience burnout and isolation",
    goal: "Find the unmet emotional needs of burned-out remote workers",
  },
  {
    label: "📵 Quitting social media",
    topic: "People who want to quit or have quit social media",
    goal: "Understand what emotionally drives the urge to disconnect",
  },
  {
    label: "🏙️ Moving to a new city alone",
    topic: "The experience of moving to a new city alone",
    goal: "Surface the loneliness and adjustment struggles people face",
  },
];

export default function Landing({
  onStarted,
  onViewSample,
}: {
  onStarted: (jobId: string, topic: string, goal: string) => void;
  onViewSample?: () => void;
}) {
  const [step, setStep] = useState<"inputs" | "review">("inputs");
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [queriesText, setQueriesText] = useState("");
  const [perQuery, setPerQuery] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!topic.trim()) {
      setError("Tell us what you want to research first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/research/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, goal }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate queries");
      setQueriesText((json.queries as string[]).join("\n"));
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate queries");
    } finally {
      setLoading(false);
    }
  }

  async function start() {
    const queries = queriesText
      .split("\n")
      .map((q) => q.trim())
      .filter(Boolean);
    if (!queries.length) {
      setError("Add at least one query.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/research/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, goal, queries, perQuery }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to start");
      onStarted(json.jobId, topic, goal);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
          Twitter / X emotional research
        </div>
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          <span className="gradient-text">What do you want</span>
          <br />
          to research today?
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
          Describe a topic and your goal. We’ll turn it into search queries, scrape X, and surface the{" "}
          <span className="text-zinc-200">raw emotions</span> and{" "}
          <span className="text-zinc-200">deeper insights</span> behind what people say.
        </p>
      </div>

      {step === "inputs" && (
        <div className="glass rounded-3xl p-6 sm:p-8">
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            What do you want to research?
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Why people stop celebrating birthdays"
            className="mb-5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-lg text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-indigo-400/60"
          />

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            What’s the goal of this research?
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={2}
            placeholder="e.g. Understand the emotions and unmet needs behind it"
            className="mb-5 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-indigo-400/60"
          />

          <div className="mb-6">
            <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Or start from an example</div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => {
                    setTopic(s.topic);
                    setGoal(s.goal);
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-indigo-400/50 hover:text-white"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</div>}

          <button
            onClick={generate}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Generating queries…" : "Generate search queries →"}
          </button>

          {onViewSample && (
            <button onClick={onViewSample} className="mt-4 w-full text-center text-sm text-zinc-500 hover:text-zinc-300">
              or explore the sample dashboard
            </button>
          )}
        </div>
      )}

      {step === "review" && (
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="mb-1 text-sm text-zinc-400">Researching</div>
          <div className="mb-5 text-xl font-semibold text-zinc-100">{topic}</div>

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Review &amp; edit the search queries (one per line)
          </label>
          <p className="mb-2 text-xs text-zinc-500">
            GPT generated these from your topic &amp; goal. Edit freely — these exact phrases are what we’ll
            search on X.
          </p>
          <textarea
            value={queriesText}
            onChange={(e) => setQueriesText(e.target.value)}
            rows={10}
            className="mb-5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-zinc-100 outline-none focus:border-indigo-400/60"
          />

          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-zinc-400">Tweets per query</span>
            <select
              value={perQuery}
              onChange={(e) => setPerQuery(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-zinc-200 outline-none"
            >
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-zinc-600">
              {queriesText.split("\n").filter((q) => q.trim()).length} queries
            </span>
          </div>

          {error && <div className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</div>}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("inputs")}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:text-white"
            >
              ← Back
            </button>
            <button
              onClick={generate}
              disabled={loading}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:text-white disabled:opacity-60"
            >
              ↻ Regenerate
            </button>
            <button
              onClick={start}
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Starting…" : "Approve & start research →"}
            </button>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-zinc-600">
        Scrapes X using your authenticated session · analysis by GPT · runs locally
      </p>
    </div>
  );
}
