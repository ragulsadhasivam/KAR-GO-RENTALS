import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vehicleSchema, pricingSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const includeArchived = req.nextUrl.searchParams.get("archived") === "1";
  const vehicles = await prisma.vehicle.findMany({
    where: includeArchived ? {} : { archived: false },
    include: { pricing: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ vehicles });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = vehicleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const pricingParsed = pricingSchema.omit({ vehicleId: true }).safeParse(body.pricing ?? {});

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        ...parsed.data,
        registrationNumber: parsed.data.registrationNumber.toUpperCase(),
        imageUrl: body.imageUrl || null,
      },
    });

    if (pricingParsed.success) {
      await prisma.vehiclePricing.create({
        data: { vehicleId: vehicle.id, ...pricingParsed.data },
      });
    }

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A vehicle with this registration number already exists." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not add vehicle." }, { status: 500 });
  }
}
