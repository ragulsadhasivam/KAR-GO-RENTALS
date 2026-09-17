import { prisma } from "@/lib/prisma";

/**
 * A booking no longer carries a known/expected return date up front (the
 * actual return is only recorded when the vehicle physically comes back),
 * so date-range overlap checking isn't possible. Availability is simply:
 * does this vehicle already have a BOOKED or ACTIVE booking right now.
 */
export async function findBlockingBooking(vehicleId: string, excludeBookingId?: string) {
  return prisma.booking.findFirst({
    where: {
      vehicleId,
      status: { in: ["BOOKED", "ACTIVE"] },
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
    },
    include: { customer: true },
    orderBy: { pickupAt: "asc" },
  });
}
