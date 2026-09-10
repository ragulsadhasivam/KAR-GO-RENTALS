import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, hashPassword, verifyPassword } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const data: any = {};
  for (const key of ["name", "mobile", "photoUrl"] as const) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  if (body.newPassword) {
    if (!body.currentPassword || !(await verifyPassword(body.currentPassword, admin.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    if (String(body.newPassword).length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }
    data.passwordHash = await hashPassword(body.newPassword);
  }

  const updated = await prisma.admin.update({ where: { id: admin.id }, data });
  const { passwordHash, ...safe } = updated;
  return NextResponse.json({ admin: safe });
}
