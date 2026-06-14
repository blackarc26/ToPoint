/**
 * Research — GPT analysis layer.
 *
 * Reads the merged dataset (tweets-data/research/dataset.csv), runs each tweet
 * through GPT to extract the structured analysis (raw emotional signal + deeper
 * insight), and writes analyzed.json (dashboard) + analyzed.csv (inspection).
 *
 * Resumable, topic-aware (uses the run's topic + goal as context), and resilient
 * to per-tweet failures.
 *
 * Run:  npm run analyze
 */

import * as fs from "fs";
import path from "path";
import chalk from "chalk";
import Papa from "papaparse";
import OpenAI from "openai";
import { OPENAI_API_KEY, OPENAI_MODEL } from "../env";
import {
  ANALYZED_CSV,
  ANALYZED_JSON,
  DATASET_CSV,
  readMeta,
  readRunConfig,
  writeMeta,
} from "./run-config";
import {
  ANALYSIS_JSON_SCHEMA,
  buildSystemPrompt,
  FALLBACK_ANALYSIS,
  type TweetAnalysis,
} from "./analysis-schema";

const CONFIG = {
  CONCURRENCY: Number(process.env.ANALYZE_CONCURRENCY || 5),
  LIMIT: Number(process.env.ANALYZE_LIMIT || 0),
  MODEL: OPENAI_MODEL,
};

type TweetRow = Record<string, string>;
export type AnalyzedTweet = TweetRow & { analysis: TweetAnalysis };

function resolveTopic(): string {
  const meta = readMeta();
  const run = readRunConfig();
  const topic = meta?.topic || run?.topic || "general emotional research";
  const goal = meta?.goal || run?.goal || "";
  return goal ? `${topic} — goal: ${goal}` : topic;
}

function readTweets(): TweetRow[] {
  if (!fs.existsSync(DATASET_CSV)) {
    throw new Error(`Dataset not found at ${DATASET_CSV}. Run \`npm run collect\` first.`);
  }
  const parsed = Papa.parse<TweetRow>(fs.readFileSync(DATASET_CSV, "utf8"), {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data.filter((r) => r && r.id_str && r.full_text);
}

function loadExisting(): AnalyzedTweet[] {
  if (!fs.existsSync(ANALYZED_JSON)) return [];
  try {
    return JSON.parse(fs.readFileSync(ANALYZED_JSON, "utf8")) as AnalyzedTweet[];
  } catch {
    return [];
  }
}

function writeOutput(rows: AnalyzedTweet[]) {
  fs.mkdirSync(path.dirname(ANALYZED_JSON), { recursive: true });
  fs.writeFileSync(ANALYZED_JSON, JSON.stringify(rows, null, 2));

  const flat = rows.map((r) => {
    const base: Record<string, string> = {
      id_str: r.id_str,
      username: r.username ?? "",
      full_text: r.full_text,
      tweet_url: r.tweet_url ?? "",
      source_query: r.source_query ?? "",
    };
    for (const [k, v] of Object.entries(r.analysis)) {
      base[`ai_${k}`] = Array.isArray(v) ? v.join(" | ") : String(v);
    }
    return base;
  });
  fs.writeFileSync(ANALYZED_CSV, Papa.unparse(flat, { quotes: true }) + "\r\n");
}

async function analyzeTweet(client: OpenAI, systemPrompt: string, tweet: TweetRow): Promise<TweetAnalysis> {
  const userContent = `Tweet by @${tweet.username || "unknown"}:\n"""${tweet.full_text}"""`;

  const response = await client.chat.completions.create({
    model: CONFIG.MODEL,
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "tweet_analysis",
        strict: true,
        schema: ANALYSIS_JSON_SCHEMA as unknown as Record<string, unknown>,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from model");
  return JSON.parse(content) as TweetAnalysis;
}

async function runPool<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index]);
    }
  });
  await Promise.all(runners);
}

async function main() {
  if (!OPENAI_API_KEY) {
    console.error(
      chalk.red("\nMissing OPENAI_API_KEY.\n") +
        chalk.yellow("Add it to Twitter_insights/.env:\n  OPENAI_API_KEY=sk-...\n")
    );
    process.exit(1);
  }

  const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  const systemPrompt = buildSystemPrompt(resolveTopic());

  const allTweets = readTweets();
  const existing = loadExisting();
  const doneIds = new Set(existing.map((r) => r.id_str));

  let pending = allTweets.filter((t) => !doneIds.has(t.id_str));
  if (CONFIG.LIMIT > 0) pending = pending.slice(0, CONFIG.LIMIT);

  console.info(
    chalk.bold.cyan(
      `\nResearch Analysis\nmodel: ${CONFIG.MODEL} · ${allTweets.length} tweets · ${doneIds.size} done · ${pending.length} to do · concurrency ${CONFIG.CONCURRENCY}\n`
    )
  );

  if (!pending.length) {
    console.info(chalk.green("Nothing to analyze — all tweets already processed.\n"));
    return;
  }

  const results: AnalyzedTweet[] = [...existing];
  let completed = 0;
  let failed = 0;

  await runPool(pending, CONFIG.CONCURRENCY, async (tweet) => {
    let analysis: TweetAnalysis;
    try {
      analysis = await analyzeTweet(client, systemPrompt, tweet);
    } catch (error) {
      failed++;
      const msg = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`  x ${tweet.id_str} (@${tweet.username}): ${msg}`));
      analysis = { ...FALLBACK_ANALYSIS };
    }

    const carried: TweetRow = {};
    for (const [k, v] of Object.entries(tweet)) carried[k] = v;
    results.push({ ...carried, analysis } as AnalyzedTweet);

    completed++;
    if (completed % 10 === 0 || completed === pending.length) {
      writeOutput(results);
      process.stdout.write(chalk.gray(`  ...${completed}/${pending.length} analyzed\n`));
    }
  });

  writeOutput(results);
  writeMeta({ analyzedAt: new Date().toISOString(), totalAnalyzed: results.length });

  const relevant = results.filter((r) => r.analysis.relevant && r.analysis.personal_experience);
  console.info(
    chalk.bold.green(
      `\nDone. ${completed} analyzed (${failed} failed).\n` +
        `Relevant personal-experience tweets: ${relevant.length}/${results.length}\n` +
        `JSON: ${ANALYZED_JSON}\n`
    )
  );
}

main();
