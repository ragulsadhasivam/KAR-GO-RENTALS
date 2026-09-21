import { NextRequest, NextResponse } from "next/server";
import { getSessionAdminId } from "@/lib/auth";
import { getSupabaseAdmin, UPLOADS_BUCKET } from "@/lib/supabase";

const FOLDER = /^[a-z0-9-]+$/i;
const FILE = /^[a-z0-9-]+\.(jpe?g|png|webp|gif|pdf)$/i;
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  // middleware exempts /uploads from its login redirect, so the session is enforced here.
  if (!(await getSessionAdminId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: segments } = await params;
  if (segments.length !== 2 || !FOLDER.test(segments[0]) || !FILE.test(segments[1])) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await getSupabaseAdmin()
    .storage.from(UPLOADS_BUCKET)
    .download(`${segments[0]}/${segments[1]}`);
  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = segments[1].split(".").pop()!.toLowerCase();
  return new NextResponse(await data.arrayBuffer(), {
    headers: {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
