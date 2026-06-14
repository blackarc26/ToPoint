import { NextResponse } from "next/server";
import { loadData } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { data, meta, isSample } = loadData();
  return NextResponse.json({ data, meta, isSample });
}
