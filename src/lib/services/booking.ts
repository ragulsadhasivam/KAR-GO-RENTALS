import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Finds an open (BOOKED or ACTIVE) booking on this vehicle whose dates overlap
 * the requested window [from, to). A booking with no expected return date
 * (created before that field existed) is treated as open-ended. A car that is
 * out and past its expected return is treated as busy until it comes back.
 */
export async function findBlockingBooking(
  vehicleId: string,
  window: { from: Date; to: Date },
  excludeBookingId?: string,
  db: Prisma.TransactionClient | typeof prisma = prisma
) {
  const open = await db.booking.findMany({
    where: {
      vehicleId,
      status: { in: ["BOOKED", "ACTIVE"] },
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
    },
    include: { customer: true },
    orderBy: { pickupAt: "asc" },
  });

  const now = Date.now();
  return (
    open.find((b) => {
      let end = b.expectedReturnAt ? b.expectedReturnAt.getTime() : Infinity;
      if (b.status === "ACTIVE") end = Math.max(end, now);
      return b.pickupAt.getTime() < window.to.getTime() && end > window.from.getTime();
    }) ?? null
  );
}

export function describeBookedWindow(b: { code: string; pickupAt: Date; expectedReturnAt: Date | null }) {
  const fmt = (d: Date) =>
    d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  return b.expectedReturnAt
    ? `${b.code}, ${fmt(b.pickupAt)} to ${fmt(b.expectedReturnAt)}`
    : `${b.code}, from ${fmt(b.pickupAt)}`;
}
