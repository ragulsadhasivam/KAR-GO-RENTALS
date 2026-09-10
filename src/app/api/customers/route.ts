import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const customers = await prisma.customer.findMany({
    where: q
      ? { OR: [{ fullName: { contains: q } }, { mobile: { contains: q } }] }
      : undefined,
    include: { bookings: { include: { payments: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ customers });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  try {
    const customer = await prisma.customer.create({ data: parsed.data });
    return NextResponse.json({ customer }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A customer with this mobile number already exists." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not add customer." }, { status: 500 });
  }
}
