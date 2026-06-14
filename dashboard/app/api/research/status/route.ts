import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const job = getJob(id);
  if (!job) return NextResponse.json({ error: "Unknown job" }, { status: 404 });
  return NextResponse.json(job);
}
