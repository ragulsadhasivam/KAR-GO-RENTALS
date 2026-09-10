import { prisma } from "@/lib/prisma";
import { ReportsPageClient } from "./ReportsPageClient";

export default async function ReportsPage() {
  const vehicles = await prisma.vehicle.findMany({ where: { archived: false } });
  return <ReportsPageClient vehicles={vehicles} />;
}
