import { NextRequest, NextResponse } from "next/server";
import { findConflictingBooking } from "@/lib/services/booking";
import { prisma } from "@/lib/prisma";
import { vehicleName } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const vehicleId = req.nextUrl.searchParams.get("vehicleId");
  const pickupAt = req.nextUrl.searchParams.get("pickupAt");
  const returnAt = req.nextUrl.searchParams.get("returnAt");
  const excludeBookingId = req.nextUrl.searchParams.get("excludeBookingId") ?? undefined;

  if (!vehicleId || !pickupAt || !returnAt) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

  if (vehicle.status === "SERVICE") {
    return NextResponse.json({
      available: false,
      reason: "SERVICE",
      message: `${vehicleName(vehicle)} is currently marked as in service.`,
    });
  }

  const conflict = await findConflictingBooking(vehicleId, new Date(pickupAt), new Date(returnAt), excludeBookingId);

  if (conflict) {
    return NextResponse.json({
      available: false,
      reason: "CONFLICT",
      message: `Vehicle unavailable for this time.`,
      conflict: {
        bookingId: conflict.id,
        code: conflict.code,
        customerName: conflict.customer.fullName,
        pickupAt: conflict.pickupAt,
        returnAt: conflict.returnAt,
        status: conflict.status,
      },
    });
  }

  return NextResponse.json({ available: true });
}
