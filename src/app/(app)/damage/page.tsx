import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { DamagePageClient } from "./DamagePageClient";

export default async function DamagePage() {
  const [incidents, vehicles, bookings, customers] = await Promise.all([
    prisma.damageIncident.findMany({
      include: { vehicle: true, booking: true, customer: true },
      orderBy: { date: "desc" },
    }),
    prisma.vehicle.findMany({ where: { archived: false } }),
    prisma.booking.findMany({ include: { customer: true, vehicle: true }, orderBy: { pickupAt: "desc" } }),
    prisma.customer.findMany({ orderBy: { fullName: "asc" } }),
  ]);

  return (
    <Suspense>
      <DamagePageClient incidents={incidents} vehicles={vehicles} bookings={bookings} customers={customers} />
    </Suspense>
  );
}
