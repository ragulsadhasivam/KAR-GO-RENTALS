import { prisma } from "@/lib/prisma";
import { DocumentsPageClient } from "./DocumentsPageClient";

export default async function DocumentsPage() {
  const [documents, vehicles] = await Promise.all([
    prisma.vehicleDocument.findMany({ include: { vehicle: true }, orderBy: { createdAt: "desc" } }),
    prisma.vehicle.findMany({ where: { archived: false } }),
  ]);

  return <DocumentsPageClient documents={documents} vehicles={vehicles} />;
}
