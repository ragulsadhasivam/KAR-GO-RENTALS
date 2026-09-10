import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingDetailClient } from "./BookingDetailClient";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: { include: { pricing: true } },
      payments: { orderBy: { date: "desc" }, include: { addedBy: true } },
      handover: true,
      vehicleReturn: true,
      incidents: true,
    },
  });
  if (!booking) notFound();

  return <BookingDetailClient booking={booking} />;
}
