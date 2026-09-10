import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findConflictingBooking } from "@/lib/services/booking";
import { syncVehicleStatus } from "@/lib/services/vehicleStatus";
import { nextBookingCode } from "@/lib/services/counter";
import { customerSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const q = req.nextUrl.searchParams.get("q")?.trim();

  const bookings = await prisma.booking.findMany({
    where: {
      status: status && status !== "ALL" ? status : undefined,
      OR: q
        ? [
            { code: { contains: q } },
            { customer: { fullName: { contains: q } } },
            { customer: { mobile: { contains: q } } },
            { vehicle: { registrationNumber: { contains: q } } },
          ]
        : undefined,
    },
    include: { customer: true, vehicle: true, payments: true },
    orderBy: { pickupAt: "desc" },
  });

  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const pickupAt = new Date(body.pickupAt);
  const returnAt = new Date(body.returnAt);

  if (!(returnAt > pickupAt)) {
    return NextResponse.json({ error: "Return date/time must be after pickup date/time." }, { status: 400 });
  }
  if (!body.vehicleId) {
    return NextResponse.json({ error: "Select a vehicle." }, { status: 400 });
  }
  if (body.currentKm != null && body.currentKm !== "" && !(Number(body.currentKm) >= 0)) {
    return NextResponse.json({ error: "Enter a valid current KM reading." }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: body.vehicleId } });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
  if (vehicle.status === "SERVICE") {
    return NextResponse.json({ error: "This vehicle is currently marked as in service." }, { status: 400 });
  }

  const conflict = await findConflictingBooking(body.vehicleId, pickupAt, returnAt);
  if (conflict) {
    return NextResponse.json(
      {
        error: `Vehicle unavailable for this time. Conflicts with booking ${conflict.code} (${conflict.customer.fullName}).`,
      },
      { status: 409 }
    );
  }

  try {
    let customerId = body.customerId as string | undefined;

    if (!customerId && body.newCustomer) {
      const parsedCustomer = customerSchema.safeParse(body.newCustomer);
      if (!parsedCustomer.success) {
        return NextResponse.json(
          { error: parsedCustomer.error.issues[0]?.message ?? "Customer details are incomplete." },
          { status: 400 }
        );
      }
      const existing = await prisma.customer.findUnique({ where: { mobile: parsedCustomer.data.mobile } });
      const customer = existing ?? (await prisma.customer.create({ data: parsedCustomer.data }));
      customerId = customer.id;
    }

    if (!customerId) {
      return NextResponse.json({ error: "Select an existing customer or add a new one." }, { status: 400 });
    }

    const totalAmount = Number(body.totalAmount);
    if (!(totalAmount >= 0)) {
      return NextResponse.json({ error: "Enter a valid rental amount." }, { status: 400 });
    }

    const code = await nextBookingCode();

    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          code,
          customerId,
          vehicleId: body.vehicleId,
          pickupAt,
          returnAt,
          pickupLocation: body.pickupLocation,
          returnLocation: body.returnLocation,
          currentKm: body.currentKm != null && body.currentKm !== "" ? Number(body.currentKm) : null,
          dailyRate: Number(body.dailyRate),
          rentalDays: Number(body.rentalDays),
          extraHourRate: Number(body.extraHourRate),
          extraHours: Number(body.extraHours || 0),
          extraKmRate: Number(body.extraKmRate),
          discount: Number(body.discount || 0),
          totalAmount,
          status: "BOOKED",
        },
      });

      if (body.amountPaid && Number(body.amountPaid) > 0) {
        await tx.payment.create({
          data: {
            bookingId: created.id,
            amount: Number(body.amountPaid),
            method: body.paymentMethod || "CASH",
          },
        });
      }

      await syncVehicleStatus(body.vehicleId, tx);
      return created;
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Could not create booking. Please try again." }, { status: 500 });
  }
}
