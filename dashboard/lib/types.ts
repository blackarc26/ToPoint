export type Emotion =
  | "loneliness"
  | "sadness"
  | "disappointment"
  | "anxiety"
  | "anger"
  | "fear"
  | "depression"
  | "indifference"
  | "acceptance"
  | "hope"
  | "joy"
  | "gratitude"
  | "excitement"
  | "mixed"
  | "unknown";

export type Sentiment = "positive" | "negative" | "neutral" | "mixed";

export type TweetAnalysis = {
  relevant: boolean;
  personal_experience: boolean;
  // raw signal
  emotion: Emotion;
  sentiment: Sentiment;
  intensity: number;
  // gpt insight
  theme: string;
  surface_summary: string;
  insight: string;
  impact: string;
  opportunity: string;
  // meta
  confidence: number;
  likely_open_to_conversation: boolean;
  follow_up_question: string;
  key_phrases: string[];
};

export type AnalyzedTweet = {
  id_str: string;
  created_at?: string;
  full_text: string;
  username?: string;
  tweet_url?: string;
  lang?: string;
  location?: string;
  favorite_count?: string;
  reply_count?: string;
  retweet_count?: string;
  category?: string;
  source_query?: string;
  matched_queries?: string;
  match_count?: string;
  analysis: TweetAnalysis;
};

export type RunMeta = {
  topic: string;
  goal: string;
  queries: { phrase: string; category?: string }[];
  lang: string;
  perQuery: number;
  collectedAt?: string;
  analyzedAt?: string;
  totalCollected?: number;
  totalAnalyzed?: number;
};

export const NEGATIVE_EMOTIONS: Emotion[] = [
  "loneliness",
  "sadness",
  "disappointment",
  "anxiety",
  "anger",
  "fear",
  "depression",
];

export const POSITIVE_EMOTIONS: Emotion[] = [
  "acceptance",
  "hope",
  "joy",
  "gratitude",
  "excitement",
];

export const EMOTION_COLORS: Record<Emotion, string> = {
  loneliness: "#818cf8",
  sadness: "#60a5fa",
  disappointment: "#a78bfa",
  anxiety: "#fbbf24",
  anger: "#fb7185",
  fear: "#f472b6",
  depression: "#f87171",
  indifference: "#94a3b8",
  acceptance: "#34d399",
  hope: "#2dd4bf",
  joy: "#4ade80",
  gratitude: "#22d3ee",
  excitement: "#fb923c",
  mixed: "#c084fc",
  unknown: "#52525b",
};

export const SENTIMENT_COLORS: Record<Sentiment, string> = {
  positive: "#34d399",
  negative: "#fb7185",
  neutral: "#94a3b8",
  mixed: "#c084fc",
};
