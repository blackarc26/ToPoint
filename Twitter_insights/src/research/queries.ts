/**
 * Birthday Research Intelligence Platform — search query catalog.
 *
 * Replaces the single "Gibran" test keyword with the multi-query research
 * collection strategy (Categories A–E from the project README).
 *
 * Each phrase is searched as an EXACT phrase (it gets wrapped in quotes by the
 * collector), optionally constrained to a language, so we capture the specific
 * emotional signal rather than loosely-related chatter.
 */

export type ResearchCategory = "A" | "B" | "C" | "D" | "E";

export type ResearchQuery = {
  /** Exact phrase to search for. The collector wraps this in quotes. */
  phrase: string;
  category: ResearchCategory;
};

export const CATEGORY_LABELS: Record<ResearchCategory, string> = {
  A: "Explicit Non-Celebration Signals",
  B: "Loneliness Signals",
  C: "Negative Emotion Signals",
  D: "Work & Responsibility Signals",
  E: "Aging Signals",
};

/**
 * Lower number = higher collection priority. Category A (explicit
 * non-celebration) is the highest-value signal per the README.
 */
export const CATEGORY_PRIORITY: Record<ResearchCategory, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
};

export const RESEARCH_QUERIES: ResearchQuery[] = [
  // Category A — Explicit Non-Celebration Signals (highest priority)
  { phrase: "didn't celebrate my birthday", category: "A" },
  { phrase: "did not celebrate my birthday", category: "A" },
  { phrase: "stopped celebrating my birthday", category: "A" },
  { phrase: "missed my birthday", category: "A" },
  { phrase: "forgot it was my birthday", category: "A" },
  { phrase: "didn't do anything for my birthday", category: "A" },
  { phrase: "don't celebrate birthdays anymore", category: "A" },

  // Category B — Loneliness Signals
  { phrase: "spent my birthday alone", category: "B" },
  { phrase: "birthday lonely", category: "B" },
  { phrase: "birthday loneliness", category: "B" },
  { phrase: "nobody remembered my birthday", category: "B" },
  { phrase: "alone on my birthday", category: "B" },
  { phrase: "birthday sadness", category: "B" },

  // Category C — Negative Emotion Signals
  { phrase: "birthday depression", category: "C" },
  { phrase: "birthday anxiety", category: "C" },
  { phrase: "birthday sucks", category: "C" },
  { phrase: "hate my birthday", category: "C" },
  { phrase: "sad on my birthday", category: "C" },
  { phrase: "birthday feels different", category: "C" },

  // Category D — Work & Responsibility Signals
  { phrase: "worked on my birthday", category: "D" },
  { phrase: "spent my birthday working", category: "D" },
  { phrase: "too busy for my birthday", category: "D" },
  { phrase: "birthday at work", category: "D" },

  // Category E — Aging Signals
  { phrase: "turned 30 today", category: "E" },
  { phrase: "turned 40 today", category: "E" },
  { phrase: "turned 50 today", category: "E" },
  { phrase: "another birthday", category: "E" },
  { phrase: "another year older", category: "E" },
  { phrase: "just another birthday", category: "E" },
];

/** Queries sorted highest-priority-first, for collection ordering. */
export const PRIORITIZED_QUERIES: ResearchQuery[] = [...RESEARCH_QUERIES].sort(
  (a, b) => CATEGORY_PRIORITY[a.category] - CATEGORY_PRIORITY[b.category]
);

/** Filesystem-safe slug for a phrase, used as the per-query CSV filename. */
export function querySlug(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
