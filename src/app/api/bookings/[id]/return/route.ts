import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncVehicleStatus } from "@/lib/services/vehicleStatus";
import { vehicleReturnSchema } from "@/lib/validations";
import { calculateRentalBill } from "@/lib/rentalBilling";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = vehicleReturnSchema.safeParse({ ...body, bookingId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid return details" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id }, include: { handover: true } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.status !== "ACTIVE") {
    return NextResponse.json({ error: "This booking is not currently active." }, { status: 400 });
  }
  if (booking.handover && parsed.data.endingKm < booking.handover.startingKm) {
    return NextResponse.json({ error: "Ending KM cannot be less than the starting KM." }, { status: 400 });
  }
  if (!(parsed.data.returnAt > booking.pickupAt)) {
    return NextResponse.json(
      { error: "Return date and time must be later than the pickup date and time." },
      { status: 400 }
    );
  }

  // The actual rental duration is only knowable now, from pickup vs actual
  // return. Recomputed fresh from the single shared calculator (never
  // manually entered, never incrementally adjusted) so this can't double-
  // count or drift from what every other screen shows.
  const bill = calculateRentalBill({
    pickupAt: booking.pickupAt,
    returnAt: parsed.data.returnAt,
    dailyRate: booking.dailyRate,
    extraHourRate: booking.extraHourRate,
    extraKmRate: booking.extraKmRate,
    extraKm: parsed.data.extraKm,
    damageCharge: parsed.data.damageCharge,
    otherPenalty: parsed.data.otherPenalty,
    discount: booking.discount,
  });

  const result = await prisma.$transaction(async (tx) => {
    const vehicleReturn = await tx.vehicleReturn.create({
      data: {
        bookingId: id,
        endingKm: parsed.data.endingKm,
        fuelLevel: parsed.data.fuelLevel,
        newDamageNotes: parsed.data.newDamageNotes || null,
        photos: JSON.stringify(parsed.data.photos ?? []),
        extraKm: parsed.data.extraKm,
        extraHours: bill.duration.billableHours,
        damageCharge: parsed.data.damageCharge,
        otherPenalty: parsed.data.otherPenalty,
        customerSignatureUrl: parsed.data.customerSignatureUrl || null,
        returnAt: parsed.data.returnAt,
        returnLocation: parsed.data.returnLocation,
      },
    });

    await tx.booking.update({
      where: { id },
      data: {
        status: "RETURNED",
        rentalDays: bill.duration.days,
        extraHours: bill.duration.billableHours,
        extraKm: parsed.data.extraKm,
        totalAmount: bill.finalTotal,
      },
    });
    await tx.vehicle.update({ where: { id: booking.vehicleId }, data: { currentKm: parsed.data.endingKm } });
    await syncVehicleStatus(booking.vehicleId, tx);

    return vehicleReturn;
  });

  return NextResponse.json({ vehicleReturn: result, bill }, { status: 201 });
}
