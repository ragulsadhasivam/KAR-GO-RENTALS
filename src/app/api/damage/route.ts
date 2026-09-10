import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { damageIncidentSchema } from "@/lib/validations";
import { nextIncidentCode } from "@/lib/services/counter";

export async function GET() {
  const incidents = await prisma.damageIncident.findMany({
    include: { vehicle: true, booking: true, customer: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ incidents });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = damageIncidentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;
  const code = await nextIncidentCode();

  const incident = await prisma.damageIncident.create({
    data: {
      code,
      vehicleId: d.vehicleId,
      bookingId: d.bookingId || null,
      customerId: d.customerId || null,
      date: d.date,
      description: d.description,
      photos: JSON.stringify(d.photos ?? []),
      estimatedRepairCost: d.estimatedRepairCost ?? null,
      actualRepairCost: d.actualRepairCost ?? null,
      customerCharge: d.customerCharge ?? null,
      status: d.status,
      notes: d.notes || null,
    },
  });

  return NextResponse.json({ incident }, { status: 201 });
}
