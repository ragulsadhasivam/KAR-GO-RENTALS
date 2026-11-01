import { getCurrentAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getReportsSummary } from "@/lib/services/reports";

export async function GET(req: NextRequest) {
  if (!(await getCurrentAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const start = req.nextUrl.searchParams.get("start");
  const end = req.nextUrl.searchParams.get("end");
  if (!start || !end) {
    return NextResponse.json({ error: "Missing date range" }, { status: 400 });
  }
  const summary = await getReportsSummary(new Date(start), new Date(end));
  return NextResponse.json(summary);
}
