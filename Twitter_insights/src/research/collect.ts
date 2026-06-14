/**
 * Research — multi-query collector.
 *
 * Driven by a run config (topic + user-supplied queries). Scrapes each query as
 * an exact-phrase search into its own CSV under tweets-data/research/raw/,
 * tags every row with its source query, then merges everything into one
 * deduplicated dataset. Falls back to the built-in birthday catalog if no run
 * config is present.
 *
 * Run:  npm run collect            (uses _run.json or birthday fallback)
 *       RUN_CONFIG=/path npm run collect
 */

import * as fs from "fs";
import path from "path";
import chalk from "chalk";
import { crawl } from "../crawl";
import { ACCESS_TOKEN } from "../env";
import { PRIORITIZED_QUERIES, querySlug } from "./queries";
import { mergeRawTweets } from "./merge";
import { RAW_DIR, readRunConfig, writeMeta, type RunConfig, type RunQuery } from "./run-config";

function resolveRun(): RunConfig {
  const fromConfig = readRunConfig();
  if (fromConfig) return fromConfig;

  // Fallback: the original birthday research catalog.
  return {
    topic: "Why people stop celebrating birthdays",
    goal: "Understand the emotions and root causes behind people no longer celebrating their birthdays",
    queries: PRIORITIZED_QUERIES.map((q) => ({ phrase: q.phrase, category: q.category })),
    lang: process.env.LANG_FILTER ?? "en",
    perQuery: Number(process.env.TARGET_PER_QUERY) || 30,
    searchTab: "LATEST",
  };
}

function buildSearchKeywords(query: RunQuery, lang: string): string {
  const exact = `"${query.phrase}"`;
  return lang ? `${exact} lang:${lang}` : exact;
}

async function main() {
  if (!ACCESS_TOKEN) {
    console.error(chalk.red("Missing DEV_ACCESS_TOKEN. Add your Twitter/X auth_token to .env."));
    process.exit(1);
  }

  const run = resolveRun();

  // Fresh raw dir each run so old per-query files don't leak into the merge.
  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  fs.mkdirSync(RAW_DIR, { recursive: true });

  writeMeta({
    topic: run.topic,
    goal: run.goal,
    queries: run.queries,
    lang: run.lang,
    perQuery: run.perQuery,
  });

  // Gentle pacing to avoid tripping X's search rate-limit ("Something went wrong").
  const delayBetween = Number(process.env.DELAY_BETWEEN_QUERIES_SECONDS ?? 20);
  const delayEachTweet = Number(process.env.DELAY_EACH_TWEET_SECONDS ?? 1.5);
  const delayPer100 = Number(process.env.DELAY_EVERY_100_TWEETS_SECONDS ?? 12);
  const sleep = (s: number) => new Promise((r) => setTimeout(r, s * 1000));

  console.info(
    chalk.bold.cyan(
      `\nResearch Collector\ntopic: ${run.topic}\n${run.queries.length} queries · target ${run.perQuery}/query · lang:${run.lang || "any"}\n`
    )
  );

  const summary: { query: string; status: "ok" | "failed"; error?: string }[] = [];

  for (let i = 0; i < run.queries.length; i++) {
    const query = run.queries[i];
    const slug = querySlug(query.phrase) || `query_${i + 1}`;
    const outputFilename = path.join("research", "raw", `${slug}.csv`);

    console.info(chalk.bold.blue(`\n[${i + 1}/${run.queries.length}]  "${query.phrase}"`));

    try {
      await crawl({
        ACCESS_TOKEN,
        SEARCH_KEYWORDS: buildSearchKeywords(query, run.lang),
        TARGET_TWEET_COUNT: run.perQuery,
        OUTPUT_FILENAME: outputFilename,
        SEARCH_TAB: run.searchTab,
        DELAY_EACH_TWEET_SECONDS: delayEachTweet,
        DELAY_EVERY_100_TWEETS_SECONDS: delayPer100,
        CSV_INSERT_MODE: "REPLACE",
        EXTRA_COLUMNS: {
          source_query: query.phrase,
          category: query.category || "",
        },
      });
      summary.push({ query: query.phrase, status: "ok" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`  Query failed: ${message}`));
      summary.push({ query: query.phrase, status: "failed", error: message });
    }

    if (i < run.queries.length - 1 && delayBetween > 0) {
      // Add jitter so the cadence isn't perfectly robotic.
      const wait = delayBetween + Math.floor(Math.random() * 8);
      console.info(chalk.gray(`  ...pausing ${wait}s before next query`));
      await sleep(wait);
    }
  }

  console.info(chalk.bold.cyan("\nMerging per-query results...\n"));

  let merged;
  try {
    merged = mergeRawTweets();
  } catch {
    // No per-query CSVs => every query came back empty, almost always an X
    // rate-limit / soft-block rather than a real auth problem.
    writeMeta({ collectedAt: new Date().toISOString(), totalCollected: 0 });
    console.error(
      chalk.red(
        "RATE_LIMITED: No tweets collected — X likely rate-limited/blocked the search. " +
          "Wait a few minutes, run fewer queries, or increase DELAY_BETWEEN_QUERIES_SECONDS, then retry."
      )
    );
    process.exit(3);
  }

  writeMeta({ collectedAt: new Date().toISOString(), totalCollected: merged.uniqueCount });

  const ok = summary.filter((s) => s.status === "ok").length;
  console.info(
    chalk.bold.green(
      `\nDone. ${ok}/${summary.length} queries collected.\n` +
        `Dataset: ${merged.outputPath}\n  ${merged.uniqueCount} unique tweets (from ${merged.totalRows} rows, ${merged.duplicateCount} dupes collapsed).\n`
    )
  );
}

main();
