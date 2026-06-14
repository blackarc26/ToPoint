import { spawn } from "child_process";
import * as fs from "fs";
import path from "path";
import { harvestResearchDir } from "./data";

/** Resolve the Twitter_insights project root (where the scraper lives). */
export function harvestRoot(): string {
  if (process.env.TWEET_HARVEST_DIR) return path.resolve(process.env.TWEET_HARVEST_DIR);
  return path.resolve(process.cwd(), "..", "Twitter_insights");
}

export type Phase = "queued" | "collecting" | "analyzing" | "done" | "error";

export type Job = {
  id: string;
  topic: string;
  goal: string;
  phase: Phase;
  message: string;
  collected: number;
  analyzed: number;
  total: number;
  error?: string;
  startedAt: number;
};

export type StartConfig = {
  topic: string;
  goal: string;
  queries: string[];
  lang?: string;
  perQuery?: number;
};

// Persist jobs across route module reloads in dev.
const store: Map<string, Job> =
  ((globalThis as unknown as { __researchJobs?: Map<string, Job> }).__researchJobs ??= new Map());

export function getJob(id: string): Job | null {
  return store.get(id) || null;
}

function runScript(
  scriptArgs: string[],
  env: NodeJS.ProcessEnv,
  onLine: (line: string) => void
): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn("npx", scriptArgs, { cwd: harvestRoot(), env });
    const handle = (buf: Buffer) =>
      buf
        .toString()
        .split(/\r?\n/)
        .forEach((l) => {
          if (l.trim()) onLine(l);
        });
    child.stdout.on("data", handle);
    child.stderr.on("data", handle);
    child.on("close", (code) => resolve(code ?? 0));
    child.on("error", () => resolve(1));
  });
}

/** Ask GPT (via the Twitter_insights script) for candidate queries. */
export function generateQueries(topic: string, goal: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["tsx", "src/research/generate-queries.ts"], {
      cwd: harvestRoot(),
      env: { ...process.env, GEN_TOPIC: topic, GEN_GOAL: goal },
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(err.trim() || `exited ${code}`));
      try {
        const parsed = JSON.parse(out.trim());
        if (Array.isArray(parsed)) resolve(parsed as string[]);
        else reject(new Error("Unexpected query output"));
      } catch {
        reject(new Error(`Could not parse queries: ${out.slice(0, 200)}`));
      }
    });
    child.on("error", reject);
  });
}

/** Kick off a full research run (collect -> analyze) in the background. */
export function startRun(config: StartConfig): Job {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const job: Job = {
    id,
    topic: config.topic,
    goal: config.goal,
    phase: "queued",
    message: "Starting…",
    collected: 0,
    analyzed: 0,
    total: config.queries.length,
    startedAt: Date.now(),
  };
  store.set(id, job);

  const runConfig = {
    topic: config.topic,
    goal: config.goal,
    queries: config.queries.map((phrase) => ({ phrase })),
    lang: config.lang ?? "en",
    perQuery: config.perQuery ?? 30,
    searchTab: "LATEST",
  };

  const researchDir = harvestResearchDir();
  fs.mkdirSync(researchDir, { recursive: true });
  fs.writeFileSync(path.join(researchDir, "_run.json"), JSON.stringify(runConfig, null, 2));
  // Clear any prior analysis so the dashboard reflects only this run once done.
  for (const f of ["analyzed.json", "meta.json"]) {
    const p = path.join(researchDir, f);
    if (fs.existsSync(p)) fs.rmSync(p, { force: true });
  }

  void (async () => {
    try {
      job.phase = "collecting";
      job.message = "Scraping tweets from X…";
      let rateLimited = false;
      const code1 = await runScript(["tsx", "src/research/collect.ts"], { ...process.env }, (l) => {
        const m = l.match(/\[(\d+)\/(\d+)\]\s+"(.+)"/);
        if (m) job.message = `Scraping ${m[1]}/${m[2]}: “${m[3]}”`;
        const t = l.match(/Total tweets saved:\s*(\d+)/);
        if (t) job.collected = Number(t[1]);
        const u = l.match(/(\d+) unique tweets/);
        if (u) job.collected = Number(u[1]);
        if (/RATE_LIMITED|rate limit/i.test(l)) rateLimited = true;
      });
      if (code1 !== 0) {
        throw new Error(
          rateLimited || job.collected === 0
            ? "X rate-limited the search and returned no tweets. Wait a few minutes, then retry (fewer queries helps)."
            : "Scraping failed. Check that the auth token in Twitter_insights/.env is still valid."
        );
      }

      job.phase = "analyzing";
      job.message = "Analyzing with GPT…";
      const code2 = await runScript(["tsx", "src/research/analyze.ts"], { ...process.env }, (l) => {
        const m = l.match(/\.\.\.(\d+)\/(\d+) analyzed/);
        if (m) {
          job.analyzed = Number(m[1]);
          job.message = `Analyzing ${m[1]}/${m[2]} tweets…`;
        }
        if (/Missing OPENAI_API_KEY/.test(l)) job.error = "Missing OPENAI_API_KEY in Twitter_insights/.env";
      });
      if (code2 !== 0) throw new Error(job.error || "GPT analysis failed.");

      job.phase = "done";
      job.message = "Research complete";
    } catch (e) {
      job.phase = "error";
      job.error = e instanceof Error ? e.message : String(e);
      job.message = job.error;
    }
  })();

  return job;
}
