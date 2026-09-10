import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export async function syncVehicleStatus(vehicleId: string, tx: Tx | typeof prisma = prisma) {
  const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle || vehicle.status === "SERVICE") return;

  const active = await tx.booking.findFirst({
    where: { vehicleId, status: "ACTIVE" },
  });
  if (active) {
    await tx.vehicle.update({ where: { id: vehicleId }, data: { status: "ACTIVE" } });
    return;
  }

  const booked = await tx.booking.findFirst({
    where: { vehicleId, status: "BOOKED" },
    orderBy: { pickupAt: "asc" },
  });
  await tx.vehicle.update({
    where: { id: vehicleId },
    data: { status: booked ? "BOOKED" : "AVAILABLE" },
  });
}
