import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { paymentSchema } from "@/lib/validations";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = paymentSchema.safeParse({ ...body, bookingId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payment" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id }, include: { payments: true } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  // totalAmount is 0 until the booking is returned (the final bill isn't
  // known before then), so the balance cap only applies once returned.
  if (booking.status === "RETURNED") {
    const alreadyPaid = booking.payments.reduce((s, p) => s + p.amount, 0);
    const balance = booking.totalAmount - alreadyPaid;
    if (parsed.data.amount > balance + 0.5) {
      return NextResponse.json(
        { error: `Amount exceeds the remaining balance of ₹${Math.round(balance)}.` },
        { status: 400 }
      );
    }
  }

  const admin = await getCurrentAdmin();

  const payment = await prisma.payment.create({
    data: {
      bookingId: id,
      amount: parsed.data.amount,
      method: parsed.data.method,
      date: parsed.data.date ?? new Date(),
      addedById: admin?.id,
    },
  });

  return NextResponse.json({ payment }, { status: 201 });
}
