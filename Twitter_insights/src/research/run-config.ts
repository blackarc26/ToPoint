/**
 * Shared run configuration + output paths for the research pipeline.
 *
 * A "run" is one research session: a topic + a set of user-supplied search
 * queries. The web app (or a CLI user) writes a run config, then `collect` and
 * `analyze` read it so the whole pipeline is driven by the same inputs.
 */

import * as fs from "fs";
import path from "path";
import { FOLDER_DESTINATION } from "../constants";

export const RESEARCH_DIR = path.join(FOLDER_DESTINATION, "research");
export const RAW_DIR = path.join(RESEARCH_DIR, "raw");
export const RUN_CONFIG_PATH = path.join(RESEARCH_DIR, "_run.json");
export const DATASET_CSV = path.join(RESEARCH_DIR, "dataset.csv");
export const ANALYZED_JSON = path.join(RESEARCH_DIR, "analyzed.json");
export const ANALYZED_CSV = path.join(RESEARCH_DIR, "analyzed.csv");
export const META_JSON = path.join(RESEARCH_DIR, "meta.json");

export type RunQuery = { phrase: string; category?: string };

export type RunConfig = {
  /** What the user wants to research — used as analysis context. */
  topic: string;
  /** The goal/intent of the research — sharpens query generation & analysis. */
  goal: string;
  /** Exact phrases to search Twitter/X for (GPT-generated, user-approved). */
  queries: RunQuery[];
  /** Language filter (e.g. "en"). "" disables it. */
  lang: string;
  /** Target tweets per query. */
  perQuery: number;
  searchTab: "LATEST" | "TOP";
};

export const DEFAULT_RUN: Omit<RunConfig, "queries" | "topic" | "goal"> = {
  lang: "en",
  perQuery: 30,
  searchTab: "LATEST",
};

export function readRunConfig(): RunConfig | null {
  const candidate = process.env.RUN_CONFIG || RUN_CONFIG_PATH;
  try {
    if (fs.existsSync(candidate)) {
      const parsed = JSON.parse(fs.readFileSync(candidate, "utf8"));
      if (parsed && Array.isArray(parsed.queries) && parsed.queries.length) {
        return {
          topic: parsed.topic || parsed.queries.map((q: RunQuery) => q.phrase).join(", "),
          goal: parsed.goal || "",
          queries: parsed.queries,
          lang: parsed.lang ?? DEFAULT_RUN.lang,
          perQuery: Number(parsed.perQuery) || DEFAULT_RUN.perQuery,
          searchTab: parsed.searchTab === "TOP" ? "TOP" : "LATEST",
        };
      }
    }
  } catch (err) {
    console.error("Failed to read run config:", err);
  }
  return null;
}

export function writeRunConfig(config: RunConfig) {
  fs.mkdirSync(RESEARCH_DIR, { recursive: true });
  fs.writeFileSync(RUN_CONFIG_PATH, JSON.stringify(config, null, 2));
}

export type RunMeta = {
  topic: string;
  goal: string;
  queries: RunQuery[];
  lang: string;
  perQuery: number;
  collectedAt?: string;
  analyzedAt?: string;
  totalCollected?: number;
  totalAnalyzed?: number;
};

export function readMeta(): RunMeta | null {
  try {
    if (fs.existsSync(META_JSON)) return JSON.parse(fs.readFileSync(META_JSON, "utf8"));
  } catch {
    /* ignore */
  }
  return null;
}

export function writeMeta(patch: Partial<RunMeta>) {
  const existing = readMeta() || ({} as RunMeta);
  const merged = { ...existing, ...patch };
  fs.mkdirSync(RESEARCH_DIR, { recursive: true });
  fs.writeFileSync(META_JSON, JSON.stringify(merged, null, 2));
  return merged;
}
