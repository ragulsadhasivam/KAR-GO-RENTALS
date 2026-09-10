import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getServiceReminderStatus } from "@/lib/services/serviceReminder";
import { ServicePageClient } from "./ServicePageClient";

export default async function ServicePage() {
  const [services, vehicles] = await Promise.all([
    prisma.serviceRecord.findMany({ include: { vehicle: true }, orderBy: [{ date: "desc" }, { createdAt: "desc" }] }),
    prisma.vehicle.findMany({ where: { archived: false } }),
  ]);

  const totalCost = services.reduce((s, r) => s + r.amount, 0);

  const upcoming = vehicles.map((v) => {
    const last = services.find((s) => s.vehicleId === v.id) ?? null;
    const { status, reason } = getServiceReminderStatus({
      nextServiceDate: last?.nextServiceDate ?? null,
      nextServiceKm: last?.nextServiceKm ?? null,
      currentKm: v.currentKm,
    });
    return { vehicle: v, lastService: last, status, reason };
  });

  return (
    <Suspense>
      <ServicePageClient services={services} vehicles={vehicles} totalCost={totalCost} upcoming={upcoming} />
    </Suspense>
  );
}
