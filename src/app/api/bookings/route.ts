import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findBlockingBooking } from "@/lib/services/booking";
import { syncVehicleStatus } from "@/lib/services/vehicleStatus";
import { nextBookingCode } from "@/lib/services/counter";
import { customerSchema } from "@/lib/validations";
import { sendBookingConfirmationWhatsApp } from "@/lib/services/bookingWhatsapp";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const q = req.nextUrl.searchParams.get("q")?.trim();

  const bookings = await prisma.booking.findMany({
    where: {
      status: status && status !== "ALL" ? status : undefined,
      OR: q
        ? [
            { code: { contains: q, mode: "insensitive" } },
            { customer: { fullName: { contains: q, mode: "insensitive" } } },
            { customer: { mobile: { contains: q, mode: "insensitive" } } },
            { vehicle: { registrationNumber: { contains: q, mode: "insensitive" } } },
          ]
        : undefined,
    },
    include: { customer: true, vehicle: true, payments: true, vehicleReturn: true },
    orderBy: { pickupAt: "desc" },
  });

  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const pickupAt = new Date(body.pickupAt);
  if (!body.pickupAt || Number.isNaN(pickupAt.getTime())) {
    return NextResponse.json({ error: "Enter a valid pickup date and time." }, { status: 400 });
  }
  if (!body.vehicleId) {
    return NextResponse.json({ error: "Select a vehicle." }, { status: 400 });
  }
  if (!body.pickupLocation || !String(body.pickupLocation).trim()) {
    return NextResponse.json({ error: "Enter a pickup location." }, { status: 400 });
  }
  if (body.currentKm != null && body.currentKm !== "" && !(Number(body.currentKm) >= 0)) {
    return NextResponse.json({ error: "Enter a valid current KM reading." }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: body.vehicleId } });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
  if (vehicle.status !== "AVAILABLE") {
    return NextResponse.json({ error: "This vehicle is not currently available." }, { status: 400 });
  }

  const blocking = await findBlockingBooking(body.vehicleId);
  if (blocking) {
    return NextResponse.json(
      {
        error: `Vehicle unavailable. It already has an open booking ${blocking.code} (${blocking.customer.fullName}).`,
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

    const code = await nextBookingCode();

    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          code,
          customerId,
          vehicleId: body.vehicleId,
          pickupAt,
          pickupLocation: body.pickupLocation,
          currentKm: body.currentKm != null && body.currentKm !== "" ? Number(body.currentKm) : null,
          dailyRate: Number(body.dailyRate),
          extraHourRate: Number(body.extraHourRate),
          extraKmRate: Number(body.extraKmRate),
          discount: Number(body.discount || 0),
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

    // The booking is already saved at this point — a WhatsApp failure must
    // never turn into a failed booking creation, so this is deliberately
    // outside the transaction and wrapped so it can never throw.
    const whatsapp = await sendBookingConfirmationWhatsApp(booking.id).catch((err) => {
      console.error("WhatsApp confirmation error:", err instanceof Error ? err.message : err);
      return { status: "failed" as const, error: "Unexpected error while sending the WhatsApp confirmation." };
    });

    return NextResponse.json(
      { booking: { ...booking, whatsappStatus: whatsapp.status, whatsappError: whatsapp.error ?? null }, whatsapp },
      { status: 201 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Could not create booking. Please try again." }, { status: 500 });
  }
}
