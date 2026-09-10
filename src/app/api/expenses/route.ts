import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const vehicleId = req.nextUrl.searchParams.get("vehicleId");
  const category = req.nextUrl.searchParams.get("category");

  const expenses = await prisma.expense.findMany({
    where: {
      type: type && type !== "ALL" ? type : undefined,
      vehicleId: vehicleId || undefined,
      category: category || undefined,
    },
    include: { vehicle: true, service: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ expenses });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  try {
    const expense = await prisma.$transaction(async (tx) => {
      const created = await tx.expense.create({
        data: {
          type: d.type,
          category: d.category,
          vehicleId: d.type === "CAR" ? d.vehicleId : null,
          date: d.date,
          amount: d.amount,
          vendor: d.vendor || null,
          paymentMethod: d.paymentMethod,
          billUrl: d.billUrl || null,
          notes: d.notes || null,
        },
      });

      if (d.category === "SERVICE_MAINTENANCE" && d.vehicleId) {
        await tx.serviceRecord.create({
          data: {
            expenseId: created.id,
            vehicleId: d.vehicleId,
            date: d.date,
            serviceCentre: d.serviceCentre!,
            billNumber: d.billNumber || null,
            kmAtService: d.kmAtService!,
            amount: d.amount,
            billUrl: d.billUrl || null,
            notes: d.notes || null,
            nextServiceDate: d.nextServiceDate || null,
            nextServiceKm: d.nextServiceKm ?? null,
          },
        });

        const vehicle = await tx.vehicle.findUnique({ where: { id: d.vehicleId } });
        if (vehicle && d.kmAtService! > vehicle.currentKm) {
          await tx.vehicle.update({ where: { id: d.vehicleId }, data: { currentKm: d.kmAtService! } });
        }
      }

      return created;
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not add expense." }, { status: 500 });
  }
}
