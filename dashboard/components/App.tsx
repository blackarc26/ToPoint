"use client";

import { useState } from "react";
import { AnalyzedTweet, RunMeta } from "@/lib/types";
import Landing from "./Landing";
import RunProgress from "./RunProgress";
import Dashboard from "./Dashboard";

type Result = { data: AnalyzedTweet[]; meta: RunMeta; isSample: boolean };
type View = "landing" | "running" | "dashboard";

export default function App({ initial }: { initial: Result }) {
  // If real data already exists, land on the dashboard; otherwise the landing screen.
  const [view, setView] = useState<View>(initial.isSample ? "landing" : "dashboard");
  const [result, setResult] = useState<Result>(initial);
  const [job, setJob] = useState<{ id: string; topic: string } | null>(null);

  if (view === "landing") {
    return (
      <Landing
        onStarted={(jobId, topic) => {
          setJob({ id: jobId, topic });
          setView("running");
        }}
        onViewSample={() => setView("dashboard")}
      />
    );
  }

  if (view === "running" && job) {
    return (
      <RunProgress
        jobId={job.id}
        topic={job.topic}
        onDone={(r) => {
          setResult(r);
          setView("dashboard");
        }}
        onCancel={() => setView("landing")}
      />
    );
  }

  return (
    <Dashboard
      data={result.data}
      meta={result.meta}
      isSample={result.isSample}
      onNewResearch={() => setView("landing")}
    />
  );
}
