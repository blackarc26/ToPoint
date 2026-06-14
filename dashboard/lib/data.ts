import * as fs from "fs";
import path from "path";
import { AnalyzedTweet, RunMeta } from "./types";
import { SAMPLE_DATA, SAMPLE_META } from "./sample-data";

export function harvestResearchDir(): string {
  if (process.env.RESEARCH_DIR) return path.resolve(process.env.RESEARCH_DIR);
  if (process.env.TWEET_HARVEST_DIR) {
    return path.resolve(process.env.TWEET_HARVEST_DIR, "tweets-data", "research");
  }
  return path.resolve(process.cwd(), "..", "Twitter_insights", "tweets-data", "research");
}

function analyzedPath(): string {
  return path.join(harvestResearchDir(), "analyzed.json");
}
function metaPath(): string {
  return path.join(harvestResearchDir(), "meta.json");
}

export type DataSource = {
  data: AnalyzedTweet[];
  meta: RunMeta;
  isSample: boolean;
};

export function loadData(): DataSource {
  try {
    const file = analyzedPath();
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as AnalyzedTweet[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        let meta: RunMeta | null = null;
        try {
          if (fs.existsSync(metaPath())) meta = JSON.parse(fs.readFileSync(metaPath(), "utf8"));
        } catch {
          /* ignore */
        }
        return {
          data: parsed,
          meta: meta || { ...SAMPLE_META, topic: "Research", goal: "" },
          isSample: false,
        };
      }
    }
  } catch (err) {
    console.error("Failed to read analyzed data, using sample:", err);
  }
  return { data: SAMPLE_DATA, meta: SAMPLE_META, isSample: true };
}
