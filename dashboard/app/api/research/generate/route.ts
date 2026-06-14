import { NextRequest, NextResponse } from "next/server";
import { generateQueries } from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { topic, goal } = await req.json();
    if (!topic || !String(topic).trim()) {
      return NextResponse.json({ error: "Please describe what you want to research." }, { status: 400 });
    }
    const queries = await generateQueries(String(topic).trim(), String(goal || "").trim());
    return NextResponse.json({ queries });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Query generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
