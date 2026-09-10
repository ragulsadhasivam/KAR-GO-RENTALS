import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (body.isDisabled === true) {
    const activeCount = await prisma.admin.count({ where: { isDisabled: false } });
    const target = await prisma.admin.findUnique({ where: { id } });
    if (target && !target.isDisabled && activeCount <= 1) {
      return NextResponse.json({ error: "At least one administrator must remain active." }, { status: 400 });
    }
  }

  const data: any = {};
  for (const key of ["name", "mobile", "photoUrl", "isDisabled"] as const) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (body.email !== undefined) data.email = body.email.toLowerCase();
  if (body.password) data.passwordHash = await hashPassword(body.password);

  try {
    const admin = await prisma.admin.update({ where: { id }, data });
    const { passwordHash, ...safe } = admin;
    return NextResponse.json({ admin: safe });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "An admin with this email already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not update admin." }, { status: 500 });
  }
}
