import { prisma } from "@/lib/prisma";

/**
 * Two bookings conflict if their [pickupAt, returnAt] windows overlap.
 * Only BOOKED and ACTIVE bookings block a vehicle — RETURNED ones are history.
 */
export async function findConflictingBooking(
  vehicleId: string,
  pickupAt: Date,
  returnAt: Date,
  excludeBookingId?: string
) {
  return prisma.booking.findFirst({
    where: {
      vehicleId,
      status: { in: ["BOOKED", "ACTIVE"] },
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      pickupAt: { lt: returnAt },
      returnAt: { gt: pickupAt },
    },
    include: { customer: true },
    orderBy: { pickupAt: "asc" },
  });
}

export async function getAvailableVehicleIds(pickupAt: Date, returnAt: Date) {
  const vehicles = await prisma.vehicle.findMany({ where: { archived: false } });
  const available: string[] = [];
  for (const v of vehicles) {
    const conflict = await findConflictingBooking(v.id, pickupAt, returnAt);
    if (!conflict) available.push(v.id);
  }
  return available;
}

export function computeRentalDays(pickupAt: Date, returnAt: Date) {
  const ms = returnAt.getTime() - pickupAt.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}
