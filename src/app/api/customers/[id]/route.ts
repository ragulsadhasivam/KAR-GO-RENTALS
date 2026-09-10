import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      bookings: { include: { vehicle: true, payments: true }, orderBy: { pickupAt: "desc" } },
      incidents: { include: { vehicle: true }, orderBy: { date: "desc" } },
    },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json({ customer });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = { ...body };
  if (data.licenceExpiry) data.licenceExpiry = new Date(data.licenceExpiry);

  try {
    const customer = await prisma.customer.update({ where: { id }, data });
    return NextResponse.json({ customer });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A customer with this mobile number already exists." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not update customer." }, { status: 500 });
  }
}
