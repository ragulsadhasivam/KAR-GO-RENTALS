import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncVehicleStatus } from "@/lib/services/vehicleStatus";
import { vehicleReturnSchema } from "@/lib/validations";

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

  // Deterministic, single-source-of-truth recalculation. We recompute the
  // FULL total from the booking's own rate fields plus the actual return-time
  // figures, rather than incrementing the existing totalAmount — that additive
  // approach is what silently dropped extra-KM/extra-hour charges before
  // (they were captured on VehicleReturn but never multiplied by their rates
  // and folded in), and would also double-charge if a return were ever
  // resubmitted. Recomputing from scratch is idempotent and matches the
  // documented rule:
  //   Final Total = Base Rental + Extra Hour Charges + Extra KM Charges
  //               + Damage Charge + Other Penalty - Discount
  const baseRental = booking.dailyRate * booking.rentalDays;
  const extraHourCharges = booking.extraHourRate * parsed.data.extraHours;
  const extraKmCharges = booking.extraKmRate * parsed.data.extraKm;
  const finalTotal = Math.max(
    0,
    Math.round(
      (baseRental + extraHourCharges + extraKmCharges + parsed.data.damageCharge + parsed.data.otherPenalty - booking.discount) * 100
    ) / 100
  );

  const result = await prisma.$transaction(async (tx) => {
    const vehicleReturn = await tx.vehicleReturn.create({
      data: {
        bookingId: id,
        endingKm: parsed.data.endingKm,
        fuelLevel: parsed.data.fuelLevel,
        newDamageNotes: parsed.data.newDamageNotes || null,
        photos: JSON.stringify(parsed.data.photos ?? []),
        extraKm: parsed.data.extraKm,
        extraHours: parsed.data.extraHours,
        damageCharge: parsed.data.damageCharge,
        otherPenalty: parsed.data.otherPenalty,
        customerSignatureUrl: parsed.data.customerSignatureUrl || null,
        returnAt: parsed.data.returnAt ?? new Date(),
      },
    });

    // The return-time figures become the booking's authoritative extra
    // hours/KM and total — superseding whatever was estimated at creation —
    // so every other screen (booking detail, dashboard, reports) reads a
    // single consistent number instead of a stale creation-time guess.
    await tx.booking.update({
      where: { id },
      data: {
        status: "RETURNED",
        extraHours: parsed.data.extraHours,
        extraKm: parsed.data.extraKm,
        totalAmount: finalTotal,
      },
    });
    await tx.vehicle.update({ where: { id: booking.vehicleId }, data: { currentKm: parsed.data.endingKm } });
    await syncVehicleStatus(booking.vehicleId, tx);

    return vehicleReturn;
  });

  return NextResponse.json({ vehicleReturn: result, finalTotal }, { status: 201 });
}
