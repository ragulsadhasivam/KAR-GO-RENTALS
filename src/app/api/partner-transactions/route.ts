import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { partnerTransactionSchema } from "@/lib/validations";

export async function GET() {
  const transactions = await prisma.partnerTransaction.findMany({
    include: { partner: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ transactions });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = partnerTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const transaction = await prisma.partnerTransaction.create({ data: parsed.data });
  return NextResponse.json({ transaction }, { status: 201 });
}
