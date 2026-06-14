/**
 * Research — query generation.
 *
 * Given a research topic and goal, asks GPT to propose a set of exact-phrase
 * Twitter/X search queries likely to surface genuine, first-person, emotionally
 * revealing tweets. The user reviews/edits/approves these before scraping.
 *
 * Inputs via env:  GEN_TOPIC, GEN_GOAL, GEN_COUNT (optional)
 * Output: prints a JSON array of query strings to STDOUT. Human logs go to STDERR.
 *
 * Run:  GEN_TOPIC="..." GEN_GOAL="..." npx tsx src/research/generate-queries.ts
 */

import OpenAI from "openai";
import { OPENAI_API_KEY, OPENAI_MODEL } from "../env";

const TOPIC = (process.env.GEN_TOPIC || "").trim();
const GOAL = (process.env.GEN_GOAL || "").trim();
const COUNT = Math.min(Math.max(Number(process.env.GEN_COUNT) || 12, 4), 24);

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    queries: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["queries"],
} as const;

const SYSTEM_PROMPT = `You design Twitter/X search queries for qualitative emotional research.

Given a research TOPIC and GOAL, produce short EXACT-PHRASE search queries (the kind of words real people actually tweet in the first person) that will surface genuine, personal, emotionally revealing posts — not news, brands, or generic chatter.

Rules:
- Each query is a short natural phrase someone would literally write in a tweet (3-7 words typical).
- Prefer first-person, emotional, experiential phrasing ("I feel", "nobody", "I can't", "spent my ... alone").
- Cover a range of angles/emotions related to the goal (loneliness, frustration, relief, exhaustion, etc.) — not minor rewordings of one phrase.
- No hashtags, no quotes, no boolean operators, no "lang:" — just the bare phrase.
- Avoid overly generic single words that would return noise.
Return ONLY the JSON.`;

async function main() {
  if (!OPENAI_API_KEY) {
    process.stderr.write("Missing OPENAI_API_KEY in Twitter_insights/.env\n");
    process.exit(2);
  }
  if (!TOPIC) {
    process.stderr.write("Missing GEN_TOPIC\n");
    process.exit(2);
  }

  const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  const user = `TOPIC: ${TOPIC}\nGOAL: ${GOAL || "(not specified)"}\nProduce about ${COUNT} queries.`;

  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.5,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "queries", strict: true, schema: SCHEMA as unknown as Record<string, unknown> },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    process.stderr.write("Empty response from model\n");
    process.exit(1);
  }

  const parsed = JSON.parse(content) as { queries: string[] };
  const cleaned = Array.from(
    new Set(
      (parsed.queries || [])
        .map((q) => q.replace(/^["']|["']$/g, "").trim())
        .filter((q) => q.length >= 3)
    )
  );

  // STDOUT = machine-readable result only.
  process.stdout.write(JSON.stringify(cleaned));
}

main().catch((err) => {
  process.stderr.write(`Query generation failed: ${err?.message || err}\n`);
  process.exit(1);
});
