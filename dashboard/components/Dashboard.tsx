"use client";

import { useMemo, useState } from "react";
import {
  computeKpis,
  emotionDistribution,
  opportunities,
  researchFeed,
  sentimentDistribution,
  themeDistribution,
  topPhrases,
} from "@/lib/aggregate";
import {
  AnalyzedTweet,
  Emotion,
  EMOTION_COLORS,
  RunMeta,
  Sentiment,
  SENTIMENT_COLORS,
} from "@/lib/types";
import { ClickableBar, EmotionBar, EmotionDonut } from "./charts";

type Tab = "overview" | "raw" | "insights" | "evidence";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "raw", label: "Raw Emotions", icon: "💓" },
  { key: "insights", label: "GPT Insights", icon: "🧠" },
  { key: "evidence", label: "Evidence", icon: "🔎" },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

function Stat({ label, value, hint, accent }: { label: string; value: string | number; hint?: string; accent?: string }) {
  return (
    <Card>
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-2 text-4xl font-bold tracking-tight" style={{ color: accent || "#f4f4f6" }}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </Card>
  );
}

function EmotionBadge({ emotion }: { emotion: Emotion }) {
  const c = EMOTION_COLORS[emotion];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: `${c}26`, color: c }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {emotion}
    </span>
  );
}

function SentBadge({ s }: { s: Sentiment }) {
  const c = SENTIMENT_COLORS[s];
  return (
    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: `${c}26`, color: c }}>
      {s}
    </span>
  );
}

function Intensity({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2" title={`intensity ${(value * 100).toFixed(0)}%`}>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-400" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  );
}

function TweetCard({ t }: { t: AnalyzedTweet }) {
  const a = t.analysis;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-300">@{t.username}</span>
        <div className="flex items-center gap-2">
          <SentBadge s={a.sentiment} />
          <EmotionBadge emotion={a.emotion} />
        </div>
      </div>
      <p className="text-[15px] leading-relaxed text-zinc-100">{t.full_text}</p>

      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-lg bg-white/5 p-2.5">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">Raw signal</div>
          <div className="mt-1 flex items-center gap-2 text-zinc-300">
            {a.emotion} · {a.theme || "—"}
          </div>
          <div className="mt-1.5"><Intensity value={a.intensity} /></div>
        </div>
        <div className="rounded-lg border border-indigo-400/20 bg-indigo-500/5 p-2.5">
          <div className="text-[11px] uppercase tracking-wide text-indigo-300/80">GPT insight</div>
          <div className="mt-1 text-zinc-200">{a.insight || "—"}</div>
        </div>
      </div>

      {a.follow_up_question && (
        <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/5 px-3 py-2">
          <div className="text-[11px] uppercase tracking-wide text-cyan-300/80">Suggested follow-up</div>
          <div className="mt-0.5 text-sm text-zinc-200">{a.follow_up_question}</div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex flex-wrap gap-1.5">
          {(a.key_phrases || []).slice(0, 3).map((p, i) => (
            <span key={i} className="rounded bg-white/5 px-2 py-0.5 text-xs text-zinc-400">“{p}”</span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>conf {Math.round(a.confidence * 100)}%</span>
          {t.tweet_url && (
            <a href={t.tweet_url} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200">view ↗</a>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard({
  data,
  meta,
  isSample,
  onNewResearch,
}: {
  data: AnalyzedTweet[];
  meta: RunMeta;
  isSample: boolean;
  onNewResearch: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [themeFilter, setThemeFilter] = useState<string | null>(null);
  const [emotionFilter, setEmotionFilter] = useState<Emotion | null>(null);

  const kpis = useMemo(() => computeKpis(data), [data]);
  const emotions = useMemo(() => emotionDistribution(data), [data]);
  const sentiments = useMemo(() => sentimentDistribution(data), [data]);
  const themes = useMemo(() => themeDistribution(data), [data]);
  const phrases = useMemo(() => topPhrases(data), [data]);
  const opps = useMemo(() => opportunities(data), [data]);

  const feed = useMemo(() => {
    let f = researchFeed(data);
    if (themeFilter) f = f.filter((t) => t.analysis.theme.trim().toLowerCase() === themeFilter);
    if (emotionFilter) f = f.filter((t) => t.analysis.emotion === emotionFilter);
    return f;
  }, [data, themeFilter, emotionFilter]);

  function drillTheme(key: string | null) {
    setThemeFilter(key);
    setEmotionFilter(null);
    setTab("evidence");
  }
  function drillEmotion(key: Emotion | null) {
    setEmotionFilter(key);
    setThemeFilter(null);
    setTab("evidence");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isSample ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"
              }`}
            >
              {isSample ? "Sample data" : "Live data"}
            </span>
            <span className="text-xs text-zinc-500">{kpis.totalAnalyzed} tweets analyzed</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">{meta.topic}</h1>
          {meta.goal && <p className="mt-1 max-w-2xl text-sm text-zinc-400">{meta.goal}</p>}
        </div>
        <button
          onClick={onNewResearch}
          className="rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 hover:opacity-95"
        >
          + New research
        </button>
      </header>

      {isSample && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/90">
          Showing a <strong>sample dataset</strong>. Click <strong>+ New research</strong> to run a live study —
          add your <code className="rounded bg-black/30 px-1">OPENAI_API_KEY</code> to{" "}
          <code className="rounded bg-black/30 px-1">Twitter_insights/.env</code> first.
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
              tab === t.key ? "bg-white/10 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <Stat label="Relevant tweets" value={kpis.relevant} hint="first-person & on-topic" />
            <Stat label="Negative sentiment" value={`${kpis.negativePct}%`} accent="#fb7185" />
            <Stat label="Top emotion" value={kpis.topEmotion} accent="#818cf8" />
            <Stat label="Avg intensity" value={kpis.avgIntensity} hint="0–1 scale" />
            <Stat label="Opportunities" value={kpis.opportunities} accent="#22d3ee" hint="unmet needs found" />
            <Stat label="High-confidence" value={kpis.highConfidence} hint="conf ≥ 0.7" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <div className="mb-3 text-sm font-medium text-zinc-300">💓 Emotion distribution</div>
              <EmotionBar data={emotions} />
            </Card>
            <Card>
              <div className="mb-3 text-sm font-medium text-zinc-300">🧠 Top insight themes</div>
              {themes.length ? (
                <ClickableBar data={themes} selected={themeFilter} onSelect={drillTheme} />
              ) : (
                <div className="py-10 text-center text-sm text-zinc-600">No themes yet.</div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* RAW EMOTIONS */}
      {tab === "raw" && (
        <div className="space-y-8">
          <p className="text-sm text-zinc-400">
            The <span className="text-zinc-200">raw emotional signal</span> extracted directly from each tweet —
            what people feel, before interpretation.
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <div className="mb-3 text-sm font-medium text-zinc-300">Emotion breakdown (click to see evidence)</div>
              <EmotionBar data={emotions} />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {emotions.map((e) => (
                  <button
                    key={e.key}
                    onClick={() => drillEmotion(e.key as Emotion)}
                    className="rounded-full px-2.5 py-0.5 text-xs"
                    style={{ background: `${EMOTION_COLORS[e.key as Emotion]}26`, color: EMOTION_COLORS[e.key as Emotion] }}
                  >
                    {e.label} {e.pct}%
                  </button>
                ))}
              </div>
            </Card>
            <Card className="lg:col-span-2">
              <div className="mb-3 text-sm font-medium text-zinc-300">Emotion share</div>
              <EmotionDonut data={emotions} />
            </Card>
          </div>

          <Card>
            <div className="mb-3 text-sm font-medium text-zinc-300">Sentiment polarity</div>
            <div className="flex h-8 w-full overflow-hidden rounded-full">
              {sentiments.map((s) => (
                <div
                  key={s.key}
                  title={`${s.label} ${s.pct}%`}
                  style={{ width: `${s.pct}%`, background: SENTIMENT_COLORS[s.key as Sentiment] }}
                  className="flex items-center justify-center text-xs font-medium text-black/70"
                >
                  {s.pct >= 8 ? `${s.label} ${s.pct}%` : ""}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-3 text-sm font-medium text-zinc-300">🗣️ Language — most common emotional phrases</div>
            <div className="flex flex-wrap gap-2">
              {phrases.length ? (
                phrases.map((p) => (
                  <span
                    key={p.key}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-200"
                    style={{ fontSize: `${Math.min(14 + p.count * 1.5, 22)}px` }}
                  >
                    {p.label} <span className="text-xs text-zinc-500">{p.count}</span>
                  </span>
                ))
              ) : (
                <div className="text-sm text-zinc-600">No phrases yet.</div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* GPT INSIGHTS */}
      {tab === "insights" && (
        <div className="space-y-8">
          <p className="text-sm text-zinc-400">
            GPT’s <span className="text-zinc-200">synthesized interpretation</span> — themes, root causes, and
            unmet needs beneath the raw signal.
          </p>

          <Card>
            <div className="mb-3 text-sm font-medium text-zinc-300">Theme / root-cause clusters (click to drill in)</div>
            {themes.length ? (
              <ClickableBar data={themes} selected={themeFilter} onSelect={drillTheme} colorOf={() => "#a855f7"} />
            ) : (
              <div className="py-10 text-center text-sm text-zinc-600">No themes yet.</div>
            )}
          </Card>

          <div>
            <div className="mb-3 text-sm font-medium text-zinc-300">💡 Opportunity finder — unmet emotional needs</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {opps.length ? (
                opps.slice(0, 6).map((o) => (
                  <Card key={o.theme}>
                    <div className="flex items-center justify-between">
                      <div className="text-base font-semibold text-zinc-100">{o.theme}</div>
                      <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs text-cyan-300">{o.count} signals</span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {o.examples.slice(0, 2).map((ex) => (
                        <div key={ex.id_str} className="text-sm text-zinc-400">
                          • {ex.analysis.opportunity}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => drillTheme(o.theme.toLowerCase())}
                      className="mt-3 text-xs text-indigo-300 hover:text-indigo-200"
                    >
                      see evidence →
                    </button>
                  </Card>
                ))
              ) : (
                <div className="text-sm text-zinc-600">No opportunities surfaced yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EVIDENCE */}
      {tab === "evidence" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-zinc-400">
              {feed.length} tweet{feed.length === 1 ? "" : "s"}, most significant first
            </span>
            {themeFilter && (
              <button onClick={() => setThemeFilter(null)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:text-white">
                theme: {themeFilter} ✕
              </button>
            )}
            {emotionFilter && (
              <button onClick={() => setEmotionFilter(null)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:text-white">
                emotion: {emotionFilter} ✕
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {feed.length ? (
              feed.map((t) => <TweetCard key={t.id_str} t={t} />)
            ) : (
              <div className="text-sm text-zinc-600">No tweets match the current filter.</div>
            )}
          </div>
        </div>
      )}

      <footer className="mt-12 border-t border-white/10 pt-6 text-xs text-zinc-600">
        {kpis.relevant} relevant tweets · {meta.queries?.length || 0} queries · Twitter Emotional Research Platform
      </footer>
    </div>
  );
}
