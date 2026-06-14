import { NextRequest, NextResponse } from "next/server";
import { startRun } from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "").trim();
    const goal = String(body.goal || "").trim();
    const queries: string[] = Array.isArray(body.queries)
      ? body.queries.map((q: unknown) => String(q).trim()).filter(Boolean)
      : [];

    if (!topic) return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    if (!queries.length) return NextResponse.json({ error: "No queries to run" }, { status: 400 });

    const job = startRun({
      topic,
      goal,
      queries,
      lang: body.lang || "en",
      perQuery: Number(body.perQuery) || 30,
    });

    return NextResponse.json({ jobId: job.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to start run";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
