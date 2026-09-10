import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerDetailClient } from "./CustomerDetailClient";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      bookings: { include: { vehicle: true, payments: true, vehicleReturn: true }, orderBy: { pickupAt: "desc" } },
      incidents: { include: { vehicle: true, booking: true }, orderBy: { date: "desc" } },
    },
  });
  if (!customer) notFound();

  return <CustomerDetailClient customer={customer} />;
}
