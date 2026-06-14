/**
 * Research analysis contract (topic-agnostic).
 *
 * Each tweet is reduced to two clearly-separated layers:
 *   1. RAW emotional signal  — emotion, sentiment, intensity (what they feel)
 *   2. GPT INSIGHT           — theme, insight, impact, opportunity (what it means)
 *
 * This separation is surfaced directly in the dashboard.
 */

export const EMOTIONS = [
  "loneliness",
  "sadness",
  "disappointment",
  "anxiety",
  "anger",
  "fear",
  "depression",
  "indifference",
  "acceptance",
  "hope",
  "joy",
  "gratitude",
  "excitement",
  "mixed",
  "unknown",
] as const;
export type Emotion = (typeof EMOTIONS)[number];

export const SENTIMENTS = ["positive", "negative", "neutral", "mixed"] as const;
export type Sentiment = (typeof SENTIMENTS)[number];

export type TweetAnalysis = {
  // --- relevance ---
  /** Is the tweet actually about the research topic (vs. coincidental match)? */
  relevant: boolean;
  /** First-person lived experience, vs. news/jokes/commentary? */
  personal_experience: boolean;

  // --- RAW emotional signal ---
  /** Dominant raw emotion. */
  emotion: Emotion;
  /** Overall sentiment polarity. */
  sentiment: Sentiment;
  /** Emotional intensity 0..1. */
  intensity: number;

  // --- GPT insight ---
  /** Short lowercase sub-theme label for aggregation (e.g. "burnout", "grief"). */
  theme: string;
  /** Plain restatement of what the tweet literally says. */
  surface_summary: string;
  /** The deeper insight / root cause beneath the surface. */
  insight: string;
  /** The lived impact or consequence. */
  impact: string;
  /** An unmet need or opportunity this reveals, if any ("" if none). */
  opportunity: string;

  // --- meta ---
  /** Confidence in this analysis, 0..1. */
  confidence: number;
  /** Would this person likely welcome a thoughtful follow-up? */
  likely_open_to_conversation: boolean;
  /** A specific, empathetic, non-generic follow-up question grounded in the tweet. */
  follow_up_question: string;
  /** 1-4 salient verbatim phrases driving the signal. */
  key_phrases: string[];
};

export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    relevant: { type: "boolean" },
    personal_experience: { type: "boolean" },
    emotion: { type: "string", enum: EMOTIONS as unknown as string[] },
    sentiment: { type: "string", enum: SENTIMENTS as unknown as string[] },
    intensity: { type: "number" },
    theme: { type: "string" },
    surface_summary: { type: "string" },
    insight: { type: "string" },
    impact: { type: "string" },
    opportunity: { type: "string" },
    confidence: { type: "number" },
    likely_open_to_conversation: { type: "boolean" },
    follow_up_question: { type: "string" },
    key_phrases: { type: "array", items: { type: "string" } },
  },
  required: [
    "relevant",
    "personal_experience",
    "emotion",
    "sentiment",
    "intensity",
    "theme",
    "surface_summary",
    "insight",
    "impact",
    "opportunity",
    "confidence",
    "likely_open_to_conversation",
    "follow_up_question",
    "key_phrases",
  ],
} as const;

export function buildSystemPrompt(topic: string): string {
  return `You are an empathetic behavioral researcher analyzing tweets to uncover human emotional insights.

The user is researching: "${topic}".

For each tweet, return a strict JSON object matching the provided schema. Separate the RAW emotional signal from your deeper INSIGHT:

RELEVANCE
- relevant: false if the tweet only coincidentally matches and isn't really about the topic (ads, lyrics, spam, unrelated context).
- personal_experience: true only for first-person lived experience (not news, jokes, or commentary about others).

RAW EMOTIONAL SIGNAL (what they feel — stay close to the text)
- emotion: the single dominant emotion from the allowed set. "mixed" only when two are clearly co-present; "unknown" when not inferable.
- sentiment: overall polarity (positive / negative / neutral / mixed).
- intensity: 0..1 strength of the emotion expressed.

GPT INSIGHT (what it means — go deeper)
- theme: a short lowercase label for the sub-theme, reusable across tweets (e.g. "burnout", "grief", "social isolation", "financial stress"). Prefer existing common labels over inventing new ones.
- surface_summary: a plain one-line restatement of what the tweet literally says.
- insight: the deeper root cause or pattern beneath the surface. Example: surface "worked all day" -> insight "adult responsibilities have crowded out personal rituals".
- impact: the lived consequence (e.g. "reinforced social withdrawal").
- opportunity: an unmet emotional need or opportunity this reveals, or "" if none is evident.

META
- confidence: 0..1, your certainty given how explicit the tweet is.
- likely_open_to_conversation: would this person plausibly welcome a gentle follow-up?
- follow_up_question: ONE specific, empathetic, non-generic research question grounded in THIS tweet. Avoid "How are you?".
- key_phrases: 1-4 short verbatim phrases from the tweet that carry the signal.

Be honest and calibrated. Never invent details not supported by the tweet.`;
}

export const FALLBACK_ANALYSIS: TweetAnalysis = {
  relevant: false,
  personal_experience: false,
  emotion: "unknown",
  sentiment: "neutral",
  intensity: 0,
  theme: "",
  surface_summary: "",
  insight: "",
  impact: "",
  opportunity: "",
  confidence: 0,
  likely_open_to_conversation: false,
  follow_up_question: "",
  key_phrases: [],
};
