import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getFinanceSummary, getUtilisation, monthRange } from "@/lib/services/finance";
import { VehicleDetailClient } from "./VehicleDetailClient";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      pricing: true,
      documents: { orderBy: { createdAt: "desc" } },
      bookings: { include: { customer: true, payments: true }, orderBy: { pickupAt: "desc" } },
      expenses: { orderBy: { date: "desc" } },
      services: { orderBy: { date: "desc" } },
      incidents: { include: { booking: true, customer: true }, orderBy: { date: "desc" } },
    },
  });

  if (!vehicle) notFound();

  const month = monthRange();
  const [finance, utilisation] = await Promise.all([
    getFinanceSummary(month.start, month.end, id),
    getUtilisation(id, month.start, month.end),
  ]);

  return <VehicleDetailClient vehicle={vehicle} finance={finance} utilisation={utilisation} />;
}
