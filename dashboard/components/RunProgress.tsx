"use client";

import { useEffect, useRef, useState } from "react";
import { AnalyzedTweet, RunMeta } from "@/lib/types";

type Job = {
  phase: "queued" | "collecting" | "analyzing" | "done" | "error";
  message: string;
  collected: number;
  analyzed: number;
  total: number;
  error?: string;
};

const STEPS = [
  { key: "collecting", label: "Scraping X", icon: "🔍" },
  { key: "analyzing", label: "GPT analysis", icon: "🧠" },
  { key: "done", label: "Insights ready", icon: "✨" },
];

export default function RunProgress({
  jobId,
  topic,
  onDone,
  onCancel,
}: {
  jobId: string;
  topic: string;
  onDone: (result: { data: AnalyzedTweet[]; meta: RunMeta; isSample: boolean }) => void;
  onCancel: () => void;
}) {
  const [job, setJob] = useState<Job | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/research/status?id=${jobId}`);
        const j: Job = await res.json();
        if (!active) return;
        setJob(j);
        if (j.phase === "done" && !doneRef.current) {
          doneRef.current = true;
          const r = await fetch("/api/research/result");
          const result = await r.json();
          if (active) onDone(result);
          return;
        }
        if (j.phase !== "error") setTimeout(tick, 1500);
      } catch {
        if (active) setTimeout(tick, 2000);
      }
    };
    tick();
    return () => {
      active = false;
    };
  }, [jobId, onDone]);

  const phase = job?.phase ?? "queued";
  const activeIndex = phase === "queued" ? 0 : STEPS.findIndex((s) => s.key === phase);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="gradient-text">Researching…</span>
        </h1>
        <p className="mt-3 text-lg text-zinc-400">{topic}</p>
      </div>

      <div className="glass rounded-3xl p-8">
        {/* Steps */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((s, i) => {
            const state =
              phase === "error"
                ? i <= activeIndex
                  ? "error"
                  : "todo"
                : i < activeIndex || phase === "done"
                ? "done"
                : i === activeIndex
                ? "active"
                : "todo";
            return (
              <div key={s.key} className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition ${
                    state === "active"
                      ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 animate-pulse-glow"
                      : state === "done"
                      ? "bg-emerald-500/20"
                      : state === "error"
                      ? "bg-rose-500/20"
                      : "bg-white/5"
                  }`}
                >
                  {state === "done" ? "✅" : state === "error" ? "⚠️" : s.icon}
                </div>
                <span className="mt-2 text-xs text-zinc-400">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Live message */}
        <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
          {phase === "error" ? (
            <div className="text-rose-300">
              <div className="font-medium">Something went wrong</div>
              <div className="mt-1 text-sm text-rose-300/80">{job?.error || job?.message}</div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" />
              <span className="text-zinc-200">{job?.message || "Starting…"}</span>
            </div>
          )}
          {phase !== "error" && (
            <div className="mt-3 flex gap-6 text-sm text-zinc-500">
              <span>
                Collected: <span className="text-zinc-300">{job?.collected ?? 0}</span>
              </span>
              <span>
                Analyzed: <span className="text-zinc-300">{job?.analyzed ?? 0}</span>
              </span>
              <span>
                Queries: <span className="text-zinc-300">{job?.total ?? 0}</span>
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onCancel}
          className="mt-6 w-full text-center text-sm text-zinc-500 hover:text-zinc-300"
        >
          {phase === "error" ? "← Back to start" : "Run in background — go back"}
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-zinc-600">
        A browser window may open to scrape X. This can take a few minutes.
      </p>
    </div>
  );
}
