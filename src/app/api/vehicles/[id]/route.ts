import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { pricing: true, documents: true },
  });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  return NextResponse.json({ vehicle });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

    if (body.status === "SERVICE" || (body.status === "AVAILABLE" && vehicle.status === "SERVICE")) {
      if (body.status === "AVAILABLE") {
        const activeOrBooked = await prisma.booking.findFirst({
          where: { vehicleId: id, status: { in: ["BOOKED", "ACTIVE"] } },
        });
        await prisma.vehicle.update({
          where: { id },
          data: { status: activeOrBooked ? activeOrBooked.status : "AVAILABLE" },
        });
      } else {
        const activeBooking = await prisma.booking.findFirst({
          where: { vehicleId: id, status: { in: ["BOOKED", "ACTIVE"] } },
        });
        if (activeBooking) {
          return NextResponse.json(
            { error: "This vehicle has an active or upcoming booking and cannot be marked in service." },
            { status: 400 }
          );
        }
        await prisma.vehicle.update({ where: { id }, data: { status: "SERVICE" } });
      }
    }

    const { status, pricing, archived, ...rest } = body;
    const data: any = { ...rest };
    if (typeof archived === "boolean") data.archived = archived;
    if (rest.purchaseDate) data.purchaseDate = new Date(rest.purchaseDate);
    if (rest.year) data.year = Number(rest.year);
    if (rest.purchasePrice != null) data.purchasePrice = Number(rest.purchasePrice);
    if (rest.currentKm != null) data.currentKm = Number(rest.currentKm);
    if (rest.registrationNumber) data.registrationNumber = rest.registrationNumber.toUpperCase();

    if (Object.keys(data).length > 0) {
      await prisma.vehicle.update({ where: { id }, data });
    }

    if (pricing) {
      await prisma.vehiclePricing.upsert({
        where: { vehicleId: id },
        create: {
          vehicleId: id,
          dailyRate: Number(pricing.dailyRate),
          extraHourRate: Number(pricing.extraHourRate),
          extraKmRate: Number(pricing.extraKmRate),
        },
        update: {
          dailyRate: Number(pricing.dailyRate),
          extraHourRate: Number(pricing.extraHourRate),
          extraKmRate: Number(pricing.extraKmRate),
        },
      });
    }

    const updated = await prisma.vehicle.findUnique({ where: { id }, include: { pricing: true } });
    return NextResponse.json({ vehicle: updated });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A vehicle with this registration number already exists." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not update vehicle." }, { status: 500 });
  }
}
