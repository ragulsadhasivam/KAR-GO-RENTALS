import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import { getSupabaseAdmin, UPLOADS_BUCKET } from "@/lib/supabase";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "misc";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File is too large (max 10MB)" }, { status: 400 });
  }

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "");
  const ext = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".jpg");
  const filename = `${randomUUID()}${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await getSupabaseAdmin()
    .storage.from(UPLOADS_BUCKET)
    .upload(`${safeFolder}/${filename}`, buffer, { contentType: file.type, upsert: false });
  if (error) {
    console.error("Upload to Supabase Storage failed:", error.message);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({
    url: `/uploads/${safeFolder}/${filename}`,
    fileName: file.name,
    fileType: file.type === "application/pdf" ? "pdf" : "image",
  });
}
