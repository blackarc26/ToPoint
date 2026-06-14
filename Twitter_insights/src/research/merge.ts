/**
 * Birthday Research — merge & deduplicate.
 *
 * Reads every per-query CSV in `tweets-data/research/raw/` and collapses them
 * into a single master dataset keyed by tweet `id_str`. A single tweet can be
 * surfaced by multiple queries (e.g. both "spent my birthday alone" and
 * "alone on my birthday"); rather than discarding that signal, we keep one row
 * per tweet and record every query/category that matched it.
 *
 * Run standalone:  npx tsx src/research/merge.ts
 */

import * as fs from "fs";
import path from "path";
import Papa from "papaparse";
import { RAW_DIR, DATASET_CSV as OUTPUT_PATH } from "./run-config";

export type MergeResult = {
  outputPath: string;
  uniqueCount: number;
  totalRows: number;
  duplicateCount: number;
};

type TweetRow = Record<string, string>;

function readCsv(filePath: string): TweetRow[] {
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = Papa.parse<TweetRow>(content, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data.filter((row) => row && row.id_str);
}

/** Merge a unique list of values, preserving order, joined by "; ". */
function appendUnique(existing: string | undefined, value: string | undefined): string {
  const set = new Set(
    (existing ? existing.split(";") : [])
      .map((v) => v.trim())
      .filter(Boolean)
  );
  if (value && value.trim()) set.add(value.trim());
  return Array.from(set).join("; ");
}

export function mergeRawTweets(): MergeResult {
  if (!fs.existsSync(RAW_DIR)) {
    throw new Error(`No raw data directory found at ${RAW_DIR}. Run the collector first.`);
  }

  const files = fs
    .readdirSync(RAW_DIR)
    .filter((f) => f.endsWith(".csv") && !f.endsWith(".old.csv"));

  if (!files.length) {
    throw new Error(`No per-query CSV files found in ${RAW_DIR}. Run the collector first.`);
  }

  const byId = new Map<string, TweetRow>();
  let totalRows = 0;

  for (const file of files) {
    const rows = readCsv(path.join(RAW_DIR, file));
    for (const row of rows) {
      totalRows++;
      const id = row.id_str;
      const existing = byId.get(id);

      if (!existing) {
        // First time we see this tweet: seed the matched-query aggregates.
        byId.set(id, {
          ...row,
          matched_queries: row.source_query || "",
          matched_categories: row.category || "",
          match_count: "1",
        });
      } else {
        // Seen before via another query: accumulate which queries surfaced it.
        existing.matched_queries = appendUnique(existing.matched_queries, row.source_query);
        existing.matched_categories = appendUnique(existing.matched_categories, row.category);
        existing.match_count = String(
          existing.matched_queries.split(";").filter((v) => v.trim()).length
        );
      }
    }
  }

  const merged = Array.from(byId.values());
  // Sort most-corroborated tweets first (matched by the most distinct queries).
  merged.sort((a, b) => Number(b.match_count) - Number(a.match_count));

  const csv = Papa.unparse(merged, { quotes: true, skipEmptyLines: true });
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, csv + "\r\n");

  return {
    outputPath: OUTPUT_PATH,
    uniqueCount: merged.length,
    totalRows,
    duplicateCount: totalRows - merged.length,
  };
}

// Allow running directly: `npx tsx src/research/merge.ts`
if (require.main === module) {
  const result = mergeRawTweets();
  console.info(
    `Merged ${result.totalRows} raw rows → ${result.uniqueCount} unique tweets ` +
      `(${result.duplicateCount} duplicates collapsed).\nMaster dataset: ${result.outputPath}`
  );
}
