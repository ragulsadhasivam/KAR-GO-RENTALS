import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationWhatsApp } from "@/lib/services/bookingWhatsapp";

const RESEND_COOLDOWN_MS = 10_000;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id }, select: { id: true, whatsappLastAttemptAt: true } });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  if (booking.whatsappLastAttemptAt && Date.now() - booking.whatsappLastAttemptAt.getTime() < RESEND_COOLDOWN_MS) {
    return NextResponse.json({ error: "Please wait a few seconds before resending." }, { status: 429 });
  }

  const whatsapp = await sendBookingConfirmationWhatsApp(id);
  return NextResponse.json({ whatsapp }, { status: 200 });
}
