import { prisma } from "@/lib/prisma";
import { getFinanceSummary, monthRange } from "@/lib/services/finance";
import { CarsPageClient } from "./CarsPageClient";

export default async function CarsPage() {
  const vehicles = await prisma.vehicle.findMany({
    where: { archived: false },
    include: { pricing: true },
    orderBy: { createdAt: "asc" },
  });
  const month = monthRange();

  const rows = await Promise.all(
    vehicles.map(async (vehicle) => {
      const finance = await getFinanceSummary(month.start, month.end, vehicle.id);
      const bookingsCount = await prisma.booking.count({ where: { vehicleId: vehicle.id } });
      return { vehicle, ...finance, bookingsCount };
    })
  );

  return <CarsPageClient vehicles={rows} />;
}
