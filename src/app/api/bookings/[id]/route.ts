import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: { include: { pricing: true } },
      payments: { orderBy: { date: "desc" }, include: { addedBy: true } },
      handover: true,
      vehicleReturn: true,
      incidents: true,
    },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  return NextResponse.json({ booking });
}
