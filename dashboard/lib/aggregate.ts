import { AnalyzedTweet, Emotion, NEGATIVE_EMOTIONS, Sentiment } from "./types";

/** Tweets that are genuinely relevant first-person experiences. */
export function relevantTweets(data: AnalyzedTweet[]): AnalyzedTweet[] {
  return data.filter((t) => t.analysis.relevant && t.analysis.personal_experience);
}

export type Kpis = {
  totalAnalyzed: number;
  relevant: number;
  negativePct: number;
  avgIntensity: number;
  topEmotion: string;
  highConfidence: number;
  opportunities: number;
};

export function computeKpis(data: AnalyzedTweet[]): Kpis {
  const relevant = relevantTweets(data);
  const n = relevant.length || 1;
  const negative = relevant.filter((t) => t.analysis.sentiment === "negative");
  const intensity = relevant.reduce((s, t) => s + (t.analysis.intensity || 0), 0) / n;
  const highConf = relevant.filter((t) => t.analysis.confidence >= 0.7);
  const opps = relevant.filter((t) => t.analysis.opportunity && t.analysis.opportunity.trim());

  const emo = emotionDistribution(data);
  return {
    totalAnalyzed: data.length,
    relevant: relevant.length,
    negativePct: Math.round((negative.length / n) * 100),
    avgIntensity: Math.round(intensity * 100) / 100,
    topEmotion: emo[0]?.label || "—",
    highConfidence: highConf.length,
    opportunities: opps.length,
  };
}

export type CountDatum = { key: string; label: string; count: number; pct: number };

function distribution<T extends string>(
  values: T[],
  labelOf: (v: T) => string = (v) => String(v)
): CountDatum[] {
  const total = values.length || 1;
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      label: labelOf(key),
      count,
      pct: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function emotionDistribution(data: AnalyzedTweet[]): CountDatum[] {
  return distribution(
    relevantTweets(data).map((t) => t.analysis.emotion as Emotion),
    cap
  );
}

export function sentimentDistribution(data: AnalyzedTweet[]): CountDatum[] {
  return distribution(
    relevantTweets(data).map((t) => t.analysis.sentiment as Sentiment),
    cap
  );
}

/** GPT-derived theme clusters (the "insight" aggregation). */
export function themeDistribution(data: AnalyzedTweet[], limit = 12): CountDatum[] {
  const themes = relevantTweets(data)
    .map((t) => t.analysis.theme.trim().toLowerCase())
    .filter(Boolean);
  return distribution(themes, cap).slice(0, limit);
}

export function topPhrases(data: AnalyzedTweet[], limit = 22): CountDatum[] {
  const relevant = relevantTweets(data);
  const counts = new Map<string, number>();
  for (const t of relevant) {
    for (const raw of t.analysis.key_phrases || []) {
      const p = raw.trim().toLowerCase();
      if (p.length < 3) continue;
      counts.set(p, (counts.get(p) || 0) + 1);
    }
  }
  const total = relevant.length || 1;
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, label: key, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Opportunities (unmet needs) surfaced by GPT, grouped by theme. */
export type Opportunity = { theme: string; count: number; examples: AnalyzedTweet[] };

export function opportunities(data: AnalyzedTweet[]): Opportunity[] {
  const withOpp = relevantTweets(data).filter((t) => t.analysis.opportunity && t.analysis.opportunity.trim());
  const byTheme = new Map<string, AnalyzedTweet[]>();
  for (const t of withOpp) {
    const k = t.analysis.theme.trim().toLowerCase() || "other";
    if (!byTheme.has(k)) byTheme.set(k, []);
    byTheme.get(k)!.push(t);
  }
  return Array.from(byTheme.entries())
    .map(([theme, examples]) => ({
      theme: cap(theme),
      count: examples.length,
      examples: examples.sort((a, b) => b.analysis.confidence - a.analysis.confidence),
    }))
    .sort((a, b) => b.count - a.count);
}

export function significanceScore(t: AnalyzedTweet): number {
  const a = t.analysis;
  let s = a.confidence + a.intensity * 0.8;
  if (NEGATIVE_EMOTIONS.includes(a.emotion)) s += 0.4;
  if (a.likely_open_to_conversation) s += 0.2;
  if (a.opportunity) s += 0.15;
  return s;
}

export function researchFeed(data: AnalyzedTweet[]): AnalyzedTweet[] {
  return relevantTweets(data)
    .slice()
    .sort((a, b) => significanceScore(b) - significanceScore(a));
}
