import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { BookingsPageClient } from "./BookingsPageClient";

export default async function BookingsPage() {
  const [bookings, vehicles] = await Promise.all([
    prisma.booking.findMany({
      include: { customer: true, vehicle: true, payments: true, vehicleReturn: true },
      orderBy: { pickupAt: "desc" },
    }),
    prisma.vehicle.findMany({ where: { archived: false }, include: { pricing: true } }),
  ]);

  return (
    <Suspense>
      <BookingsPageClient bookings={bookings} vehicles={vehicles} />
    </Suspense>
  );
}
