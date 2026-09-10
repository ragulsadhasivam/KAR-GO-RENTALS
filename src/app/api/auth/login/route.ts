import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!admin || admin.isDisabled) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  await createSession(admin.id);
  return NextResponse.json({ ok: true });
}
