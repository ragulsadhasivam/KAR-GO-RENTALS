import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { syncVehicleStatus } from "@/lib/services/vehicleStatus";

/**
 * Cancelling only ever applies to a booking that hasn't been picked up yet
 * (BOOKED). No refund/payment logic here by design — the business doesn't
 * collect money before the rental, so there's nothing to reverse; existing
 * payment records are left untouched.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "BOOKED") {
    return NextResponse.json(
      { error: "Only a booking that hasn't been picked up yet can be cancelled." },
      { status: 400 }
    );
  }

  const admin = await getCurrentAdmin();

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledById: admin?.id,
      },
    });
    // Re-derive the vehicle's status from its remaining bookings — a
    // cancelled booking no longer counts as BOOKED/ACTIVE, so the vehicle
    // frees up automatically via the same logic every other transition uses.
    await syncVehicleStatus(booking.vehicleId, tx);
    return result;
  });

  return NextResponse.json({ booking: updated }, { status: 200 });
}
