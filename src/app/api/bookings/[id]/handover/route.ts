import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncVehicleStatus } from "@/lib/services/vehicleStatus";
import { handoverSchema } from "@/lib/validations";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = handoverSchema.safeParse({ ...body, bookingId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid handover details" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "This booking has been cancelled and cannot be handed over." }, { status: 400 });
  }
  if (booking.status !== "BOOKED") {
    return NextResponse.json({ error: "This booking has already been handed over." }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const handover = await tx.handover.create({
      data: {
        bookingId: id,
        startingKm: parsed.data.startingKm,
        fuelLevel: parsed.data.fuelLevel,
        exteriorCondition: parsed.data.exteriorCondition,
        interiorCondition: parsed.data.interiorCondition,
        existingDamageNotes: parsed.data.existingDamageNotes || null,
        photos: JSON.stringify(parsed.data.photos ?? []),
        customerSignatureUrl: parsed.data.customerSignatureUrl || null,
        handoverAt: parsed.data.handoverAt ?? new Date(),
      },
    });

    await tx.booking.update({ where: { id }, data: { status: "ACTIVE" } });
    await tx.vehicle.update({ where: { id: booking.vehicleId }, data: { currentKm: parsed.data.startingKm } });
    await syncVehicleStatus(booking.vehicleId, tx);

    return handover;
  });

  return NextResponse.json({ handover: result }, { status: 201 });
}
