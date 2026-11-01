import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, getCurrentAdmin } from "@/lib/auth";
import { adminSchema } from "@/lib/validations";

export async function GET() {
  if (!(await getCurrentAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admins = await prisma.admin.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ admins: admins.map(({ passwordHash, ...a }) => a) });
}

export async function POST(req: NextRequest) {
  if (!(await getCurrentAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = adminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  try {
    const admin = await prisma.admin.create({
      data: {
        name: parsed.data.name,
        mobile: parsed.data.mobile,
        email: parsed.data.email.toLowerCase(),
        passwordHash: await hashPassword(parsed.data.password),
        photoUrl: parsed.data.photoUrl || null,
      },
    });
    const { passwordHash, ...safe } = admin;
    return NextResponse.json({ admin: safe }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "An admin with this email already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not add admin." }, { status: 500 });
  }
}
