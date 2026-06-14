import { AnalyzedTweet, Emotion, RunMeta, Sentiment, TweetAnalysis } from "./types";

/**
 * Curated sample so the dashboard is populated before a real run. Sample topic
 * is the original birthday research. Replace by running a real research session
 * from the landing screen (writes Twitter_insights/tweets-data/research/analyzed.json).
 */

type Mini = {
  user: string;
  url: string;
  text: string;
  emotion: Emotion;
  sentiment: Sentiment;
  intensity: number;
  theme: string;
  surface: string;
  insight: string;
  impact: string;
  opportunity: string;
  confidence: number;
  open: boolean;
  followUp: string;
  phrases: string[];
};

function build(id: string, m: Mini): AnalyzedTweet {
  const analysis: TweetAnalysis = {
    relevant: true,
    personal_experience: true,
    emotion: m.emotion,
    sentiment: m.sentiment,
    intensity: m.intensity,
    theme: m.theme,
    surface_summary: m.surface,
    insight: m.insight,
    impact: m.impact,
    opportunity: m.opportunity,
    confidence: m.confidence,
    likely_open_to_conversation: m.open,
    follow_up_question: m.followUp,
    key_phrases: m.phrases,
  };
  return { id_str: id, username: m.user, tweet_url: m.url, full_text: m.text, analysis };
}

export const SAMPLE_META: RunMeta = {
  topic: "Why people stop celebrating birthdays",
  goal: "Understand the emotions and root causes behind people no longer celebrating their birthdays",
  queries: [
    { phrase: "didn't celebrate my birthday" },
    { phrase: "spent my birthday alone" },
    { phrase: "nobody remembered my birthday" },
    { phrase: "too busy for my birthday" },
  ],
  lang: "en",
  perQuery: 30,
  totalCollected: 14,
  totalAnalyzed: 14,
};

export const SAMPLE_DATA: AnalyzedTweet[] = [
  build("s1", {
    user: "michaelryan756",
    url: "https://x.com/michaelryan756/status/1947137106612273312",
    text: "Mum died on the 12th of April — my birthday is the 14th. This year I did not celebrate my birthday.",
    emotion: "sadness", sentiment: "negative", intensity: 0.9, theme: "grief",
    surface: "didn't celebrate due to mother's recent death",
    insight: "fresh bereavement made celebration feel impossible",
    impact: "birthday now entangled with mourning",
    opportunity: "support for grief that collides with personal milestones",
    confidence: 0.92, open: true,
    followUp: "Has your birthday changed meaning since your mum passed?",
    phrases: ["mum died", "did not celebrate"],
  }),
  build("s2", {
    user: "AnnaRossa32214",
    url: "https://x.com/AnnaRossa32214/status/1927839051899347452",
    text: "I did not celebrate my birthday because I lost my job and I don't have any money.",
    emotion: "disappointment", sentiment: "negative", intensity: 0.75, theme: "financial stress",
    surface: "couldn't afford to celebrate after job loss",
    insight: "financial precarity stripped away the ability to celebrate",
    impact: "celebration felt like an unaffordable luxury",
    opportunity: "low/no-cost ways to feel celebrated",
    confidence: 0.88, open: true,
    followUp: "If money weren't a factor, how would you have wanted to mark the day?",
    phrases: ["lost my job", "don't have any money"],
  }),
  build("s3", {
    user: "JagShiro",
    url: "https://x.com/JagShiro/status/1866723533495337259",
    text: "My entire family just straight up did not celebrate my birthday, nor even tell me happy birthday.",
    emotion: "disappointment", sentiment: "negative", intensity: 0.8, theme: "family neglect",
    surface: "family forgot the birthday entirely",
    insight: "lack of acknowledgment from close ones reinforces feeling unseen",
    impact: "felt invisible within own family",
    opportunity: "tools that prompt loved ones to remember",
    confidence: 0.85, open: true,
    followUp: "Was this the first year your family forgot, or a pattern?",
    phrases: ["entire family", "nor even tell me"],
  }),
  build("s4", {
    user: "TRASHKlTTY",
    url: "https://x.com/TRASHKlTTY/status/1874048778531201459",
    text: "Barely had energy to finish anything, did not celebrate my birthday, completely lost my sense of self.",
    emotion: "depression", sentiment: "negative", intensity: 0.85, theme: "mental health",
    surface: "no energy, lost sense of self",
    insight: "depressive episode eroded motivation for self-directed rituals",
    impact: "birthday passed as another symptom of withdrawal",
    opportunity: "gentle re-engagement prompts during low periods",
    confidence: 0.83, open: false,
    followUp: "What would have made the day feel worth marking?",
    phrases: ["lost my sense of self", "no energy"],
  }),
  build("s5", {
    user: "quanti_xbt",
    url: "https://x.com/quanti_xbt/status/1994035986679071055",
    text: "Just turned 25. I don't have many friends offline. I did not celebrate my birthday, maybe I will.",
    emotion: "loneliness", sentiment: "negative", intensity: 0.7, theme: "social isolation",
    surface: "isolated, few offline friends",
    insight: "overwork and thin networks left no one to celebrate with",
    impact: "ambivalence masking a wish to be celebrated",
    opportunity: "community for people celebrating alone",
    confidence: 0.79, open: true,
    followUp: "If a friend offered to celebrate with you, would you take them up on it?",
    phrases: ["don't have many friends", "maybe I will"],
  }),
  build("s6", {
    user: "worktilldawn",
    url: "https://x.com/example/status/7",
    text: "Worked a 12-hour shift on my birthday. No cake, no nothing. Adulthood is just this now.",
    emotion: "indifference", sentiment: "negative", intensity: 0.55, theme: "burnout",
    surface: "worked a long shift instead of celebrating",
    insight: "adult responsibilities have crowded out personal rituals",
    impact: "resigned acceptance of diminished occasions",
    opportunity: "permission/nudges to take time for oneself",
    confidence: 0.81, open: false,
    followUp: "Do birthdays feel less important now than a few years ago?",
    phrases: ["12-hour shift", "adulthood is just this"],
  }),
  build("s7", {
    user: "quietorbit",
    url: "https://x.com/example/status/8",
    text: "Spent my birthday alone again. Ordered takeout for one and went to bed early. It's fine. Really.",
    emotion: "loneliness", sentiment: "negative", intensity: 0.78, theme: "social isolation",
    surface: "spent the day alone, performing contentment",
    insight: "thinning social network leaves milestones unwitnessed",
    impact: "quiet ache under performed contentment",
    opportunity: "low-pressure ways to be reached out to",
    confidence: 0.86, open: true,
    followUp: "Was there someone you wished had reached out that day?",
    phrases: ["birthday alone", "it's fine"],
  }),
  build("s8", {
    user: "calm_tide",
    url: "https://x.com/example/status/9",
    text: "Stopped making a big deal of my birthday years ago. I prefer a quiet day to myself now. No regrets.",
    emotion: "acceptance", sentiment: "positive", intensity: 0.4, theme: "intentional simplicity",
    surface: "deliberately keeps birthdays low-key",
    insight: "matured into valuing solitude over social performance",
    impact: "contentment with a self-chosen ritual",
    opportunity: "",
    confidence: 0.84, open: false,
    followUp: "What shifted that made a quiet day feel better?",
    phrases: ["quiet day", "no regrets"],
  }),
  build("s9", {
    user: "latebloomer88",
    url: "https://x.com/example/status/10",
    text: "Nobody remembered my birthday this year. Not one text. I kept checking my phone all day.",
    emotion: "sadness", sentiment: "negative", intensity: 0.82, theme: "social isolation",
    surface: "no one acknowledged the birthday",
    insight: "lack of social connection turns anticipation into hurt",
    impact: "anticipation curdled into hurt",
    opportunity: "reminders that reach a person's circle",
    confidence: 0.9, open: true,
    followUp: "Did you want to reach out to anyone but hold back?",
    phrases: ["nobody remembered", "kept checking my phone"],
  }),
  build("s10", {
    user: "thirtyandtired",
    url: "https://x.com/example/status/11",
    text: "Turned 30 today. Just another year older. Didn't tell anyone. Kind of dreading what's next.",
    emotion: "anxiety", sentiment: "negative", intensity: 0.68, theme: "aging",
    surface: "avoided the milestone, anxious about aging",
    insight: "anxiety about aging makes milestones something to avoid",
    impact: "milestone avoided rather than marked",
    opportunity: "reframing aging milestones positively",
    confidence: 0.78, open: true,
    followUp: "What about turning 30 feels like something to dread?",
    phrases: ["just another year older", "dreading what's next"],
  }),
  build("s11", {
    user: "smalljoys_",
    url: "https://x.com/example/status/12",
    text: "Didn't do anything for my birthday but a coworker left a note on my desk. That was enough. Grateful.",
    emotion: "gratitude", sentiment: "positive", intensity: 0.6, theme: "recognition",
    surface: "a small gesture made the day feel acknowledged",
    insight: "small acts of recognition outweigh elaborate celebration",
    impact: "a tiny acknowledgment outweighed the absence of plans",
    opportunity: "nudge small acts of recognition between peers",
    confidence: 0.82, open: true,
    followUp: "What made that small note feel like enough this year?",
    phrases: ["left a note", "that was enough"],
  }),
  build("s12", {
    user: "burnt_out_dev",
    url: "https://x.com/example/status/13",
    text: "Too busy for my birthday this year. Deadlines don't care what day it is. Maybe next year I'll stop.",
    emotion: "indifference", sentiment: "negative", intensity: 0.5, theme: "burnout",
    surface: "work deadlines overrode the birthday",
    insight: "burnout culture normalizes skipping personal milestones",
    impact: "self-care deferred indefinitely",
    opportunity: "workplace norms that protect personal days",
    confidence: 0.8, open: false,
    followUp: "What would need to change to actually take the day next year?",
    phrases: ["too busy", "deadlines don't care"],
  }),
  build("s13", {
    user: "okayenough",
    url: "https://x.com/example/status/14",
    text: "Birthday feels different now. Not sad exactly, just muted. Like the color drained out of it.",
    emotion: "indifference", sentiment: "neutral", intensity: 0.45, theme: "loss of meaning",
    surface: "birthdays feel emotionally muted",
    insight: "gradual erosion of meaning as circumstances changed",
    impact: "emotional flatness around a once-meaningful day",
    opportunity: "ways to rediscover meaning in rituals",
    confidence: 0.76, open: true,
    followUp: "When do you remember birthdays still feeling vivid?",
    phrases: ["feels different", "color drained out"],
  }),
  build("s14", {
    user: "hopeful_again",
    url: "https://x.com/example/status/15",
    text: "Didn't celebrate last year but this year I'm throwing myself a tiny party. Reclaiming it.",
    emotion: "hope", sentiment: "positive", intensity: 0.7, theme: "reclaiming",
    surface: "choosing to celebrate again after skipping",
    insight: "reclaiming rituals can be an act of self-repair",
    impact: "renewed sense of agency over the day",
    opportunity: "support for people re-engaging with celebration",
    confidence: 0.8, open: true,
    followUp: "What made this the year you decided to reclaim it?",
    phrases: ["reclaiming it", "tiny party"],
  }),
];
